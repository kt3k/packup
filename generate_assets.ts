/**
 * This file contains the functions which create assets from the given paths.
 * An asset is the unit of build target.
 *
 * There are 5 types of assets
 * - HtmlAsset
 * - CssAsset
 * - ScssAsset
 * - ScriptAsset - represents javascript or typescript
 * - ImageAsset
 */
import {
  basename,
  dirname,
  Document,
  DOMParser,
  Element,
  join,
  posixPathJoin,
  relative,
} from "./deps.ts";
import {
  decoder,
  encoder,
  getLocalDependencyPaths,
  isLocalUrl,
  md5,
  qs,
} from "./util.ts";
import { bundleByEsbuild } from "./bundle_util.ts";
import { logger } from "./logger_util.ts";
import { compile as compileSass } from "./sass_util.ts";
import { bundlet } from "./bundlet.ts";
import * as esbuild from "https://deno.land/x/esbuild@v0.15.11/mod.js";

// get name and prefix from src
function namePrefix(
  base: string,
  flpath: string,
): { name: string; prefix?: string } {
  let name = basename(flpath).replace(
    /[.](ts|js|mjs|css|jpg|jpeg|png|gif|svg|webp)$/i,
    "",
  );
  const hasSrc = /\bsrc\b/.test(flpath);
  const dir = dirname(hasSrc ? relative("src", flpath) : flpath);
  let prefix = "";
  if (dir !== ".") {
    name = join(dir, name);
    prefix = relative(
      /\bsrc\b/.test(base) ? relative("src", base) : base,
      ".",
    );
  }
  return { name, prefix };
}

/**
 * Options for asset generation.
 *
 * @property watchPaths true when the system is watching the paths i.e. packup serve
 * @property onBuild The hook which is called when the build is finished. Used when `packup serve`
 */
type GenerateAssetsOptions = {
  watchPaths?: boolean;
  onBuild?: () => void;
  insertLivereloadScript?: boolean;
  livereloadPort?: number;
  mainAs404?: boolean;
  publicUrl: string;
  distDir?: string;
};

/**
 * Generates assets from the given entrypoint path (html).
 * Also returns watch paths when `watchPaths` option is true.
 *
 * Used both in `packup build` and `packup serve`.
 */
export async function generateAssets(
  path: string,
  opts: GenerateAssetsOptions,
): Promise<[AsyncGenerator<File, void, void>, string[]]> {
  const buildStarted = Date.now();
  const htmlAsset = await HtmlAsset.create(path);
  const { pageName, base } = htmlAsset;
  const pathPrefix = opts.publicUrl || ".";
  const { distDir } = opts;

  const assets = [...htmlAsset.extractReferencedAssets()];

  if (opts.insertLivereloadScript) {
    htmlAsset.insertScriptTag(
      `http://localhost:${opts.livereloadPort!}/livereload.js`,
    );
  }

  const flopts = {
    pageName,
    base,
    pathPrefix,
    distDir,
  };

  const generator = (async function* () {
    for (const a of assets) {
      // TODO(kt3k): These can be concurrent
      const files = await a.createFileObject(flopts);
      for (const file of files) yield file;
    }

    // This needs to be the last.
    const files = await htmlAsset.createFileObject({
      pageName,
      base,
      pathPrefix,
      distDir,
    });
    for (const file of files) yield file;
    if (opts.mainAs404) {
      yield Object.assign(
        (await htmlAsset.createFileObject({ pageName, base, pathPrefix }))[0],
        { name: "404", lastModified: 0 },
      );
    }
    logger.log(`${path} bundled in ${Date.now() - buildStarted}ms`);

    // If build hook is set, call it. Used for live reloading.
    opts.onBuild?.();
    logger.debug("onBuild");
  })();

  const watchPaths = opts.watchPaths
    ? (await Promise.all(assets.map((a) => a.getWatchPaths(htmlAsset.base))))
      .flat()
    : [];

  return [generator, [path, ...watchPaths]];
}

/**
 * Builds the entrypoint and watches the all files referenced from the entrypoint.
 * If any change is happend in any of the watched paths, then builds again and update
 * the watching paths. Used in `packup serve`.
 */
export async function* watchAndGenAssets(
  path: string,
  opts: GenerateAssetsOptions,
): AsyncGenerator<File, void, void> {
  opts = {
    ...opts,
    watchPaths: true,
    insertLivereloadScript: true,
  };
  let [assets, watchPaths] = await generateAssets(path, opts);
  const jsopts = { pageName: "", base: "src", pathPrefix: "." };
  const pure = /.*\/([^/]+)\.[a-z\d]{32}(\.[a-z\d]{2,})$/;
  const jsext = /\.js$/i;
  while (true) {
    const c = {};
    for await (const file of assets) {
      c[file.name.replace(pure, "$1$2")] = true;
      yield file;
    }
    // generate inner modules without bundled
    for (const name of watchPaths) {
      const i = name.lastIndexOf("/");
      if (!jsext.test(name) || c[name.substring(i < 0 ? 0 : i + 1)]) {
        continue;
      }
      const files = await new ScriptAsset(relative("src", name), null)
        .createFileObject(jsopts);
      for (let i = 0, imax = files.length; i < imax; i++) {
        if (files[i]?.name) {
          yield files[i];
        }
      }
    }

    const watcher = Deno.watchFs(watchPaths);
    for await (const e of watcher) {
      logger.log("Changed: " + e.paths.join(""));
      break;
      // watcher.close();
    }
    logger.log("Rebuilding", path);
    await new Promise<void>((resolve) => setTimeout(() => resolve(), 100));
    [assets, watchPaths] = await generateAssets(path, opts);
  }
}

type CreateFileObjectParams = {
  pageName: string;
  base: string;
  pathPrefix: string;
  distDir?: string;
  options?: esbuild.BuildOptions;
};

type Asset = {
  getWatchPaths(base: string): Promise<string[]>;
  createFileObject(params: CreateFileObjectParams): Promise<File[]>;
};

const docType = encoder.encode("<!DOCTYPE html>");

/** HtmlAsset represents the html file */
class HtmlAsset implements Asset {
  static async create(path: string): Promise<HtmlAsset> {
    logger.debug("Reading", path);
    const html = decoder.decode(await Deno.readFile(path));
    return new HtmlAsset(html, path);
  }

  #doc: Document;
  #path: string;
  base: string;
  #filename: string;
  pageName: string;
  constructor(html: string, path: string) {
    this.#doc = new DOMParser().parseFromString(html, "text/html")!;
    this.#path = path;
    this.base = dirname(path);
    this.#filename = basename(path);
    if (!this.#filename.endsWith(".html")) {
      throw new Error(`Entrypoint needs to be an html file: ${path}`);
    }

    this.pageName = this.#filename.replace(/\.html$/, "");

    if (!this.pageName) {
      throw new Error(`Bad entrypoint name: ${path}`);
    }
  }

  extractReferencedAssets() {
    return extractReferencedAssets(this.#doc);
  }

  createFileObject(_params: CreateFileObjectParams) {
    const { name } = namePrefix(this.base, this.#path);
    return Promise.resolve([Object.assign(
      new Blob([docType, encoder.encode(this.#doc.documentElement!.outerHTML)]),
      {
        name,
        lastModified: (Deno.statSync(this.#path).mtime?.getTime() ?? 0) / 1000,
      },
    )]);
  }

  getWatchPaths() {
    return Promise.resolve([this.#path]);
  }

  insertScriptTag(path: string) {
    const script = this.#doc.createElement("script");
    script.setAttribute("src", path);
    this.#doc.body.insertBefore(script, null);
  }
}

/** ScssAsset represents a <link rel="stylesheet"> tag in the html */
class CssAsset implements Asset {
  static create(link: Element): CssAsset | null {
    const href = link.getAttribute("href");
    const rel = link.getAttribute("rel");
    if (rel !== "stylesheet") {
      return null;
    }
    if (!href) {
      logger.warn(
        "<link> tag has rel=stylesheet attribute, but doesn't have href attribute",
      );
      return null;
    }
    if (href.startsWith("https://") || href.startsWith("http://")) {
      // If href starts with http(s):// schemes, we consider these as
      // external reference. So skip handling these
      return null;
    }
    if (href.endsWith(".scss")) {
      return new ScssAsset(href, link);
    }
    return new CssAsset(href, link);
  }

  _el: Element;
  _href: string;
  _dest?: string;
  constructor(href: string, link: Element) {
    this._el = link;
    this._href = href;
  }

  getWatchPaths(base: string): Promise<string[]> {
    return Promise.resolve([join(base, this._href)]);
  }

  async createFileObject(
    { base, pathPrefix }: CreateFileObjectParams,
  ): Promise<File[]> {
    const flpath = join(base, this._href);
    const data = await Deno.readFile(flpath);
    const info = await Deno.stat(flpath);
    const { name, prefix } = namePrefix(base, flpath);
    this._dest = `${name}.${await md5(data)}.css`;
    this._el.setAttribute("href", join(prefix || pathPrefix, this._dest));
    return [
      Object.assign(new Blob([data]), {
        name: this._dest,
        lastModified: (info.mtime?.getTime() ?? 0) / 1000,
      }),
    ];
  }
}

/** ScssAsset represents a <link rel="stylesheet"> tag
 * with href having .scss extension in the html */
class ScssAsset extends CssAsset {
  // TODO(kt3k): implement getWatchPaths correctly
  async createFileObject(
    { base, pathPrefix }: CreateFileObjectParams,
  ): Promise<File[]> {
    const flpath = join(base, this._href);
    const scss = await Deno.readFile(flpath);
    const info = await Deno.stat(flpath);
    const { name, prefix } = namePrefix(base, flpath);
    this._dest = `${name}.${await md5(scss)}.css`;
    this._el.setAttribute("href", join(prefix || pathPrefix, this._dest));
    return [Object.assign(new Blob([await compileSass(decoder.decode(scss))]), {
      name: this._dest,
      lastModified: (info.mtime?.getTime() ?? 0) / 1000,
    })];
  }
}

/** ScriptAsset represents a <script> tag in the html */
class ScriptAsset implements Asset {
  static create(script: Element): ScriptAsset | null {
    const src = script.getAttribute("src");
    if (!src) {
      // this <script> should contain inline scripts.
      return null;
    }
    if (src.startsWith("http://") || src.startsWith("https://")) {
      // If "src" starts with http(s):// schemes, we consider these as
      // external reference. So skip handling these
      return null;
    }
    return new ScriptAsset(src, script);
  }

  #src: string;
  #dest?: string;
  #el: Element;

  constructor(src: string, script: Element) {
    this.#src = src;
    this.#el = script;
  }

  async getWatchPaths(base: string): Promise<string[]> {
    let src = this.#src;
    const i = src.indexOf("?");
    const search = i > -1 ? src.substring(i) : "";
    if (i > -1) {
      src = src.substring(0, i);
    }
    return await getLocalDependencyPaths(join(base, src));
  }

  async createFileObject({
    base,
    pathPrefix,
    distDir,
  }: CreateFileObjectParams): Promise<File[]> {
    let src = this.#src;
    const staticTag = "../static/";
    const j = src.indexOf(staticTag);
    if (j > -1) {
      if (this.#el?.getAttribute("src")?.match(src)) {
        this.#el.setAttribute("src", src.substring(j + staticTag.length - 1));
        return [];
      }
    }

    const i = src.indexOf("?");
    const search = i > -1 ? src.substring(i) : "";
    if (i > -1) {
      src = src.substring(0, i);
    }

    const flpath = join(base, src);
    const info = await Deno.stat(flpath);

    const { options, plugins } = await bundlet(flpath, pathPrefix, distDir);
    const data = await bundleByEsbuild(flpath, options, plugins);
    const { name, prefix } = namePrefix(base, flpath);
    this.#dest = `${name}.${await md5(data)}.js`;
    this.#el?.setAttribute(
      "src",
      join(prefix || pathPrefix, this.#dest) + search,
    );
    return [
      Object.assign(new Blob([data]), {
        name: this.#dest,
        lastModified: (info.mtime?.getTime() ?? 0) / 1000,
      }),
    ];
  }
}

/** ImageAsset represents a `<img>` tag in the html */
class ImageAsset implements Asset {
  static create(img: Element): ImageAsset | null {
    let sources: string[] = [];

    const src = img.getAttribute("src");
    const srcset = img.getAttribute("srcset");

    if (img.tagName === "IMG" && !src) {
      logger.warn("<img> tag doesn't have src attribute");
      return null;
    }

    if (src && isLocalUrl(src) && !src.startsWith("data:")) sources.push(src);
    if (srcset) {
      sources.push(
        ...srcset.filter((src) => !src.startsWith("data:"))
          .split(",") // Separate the different srcset
          .filter(Boolean) // Remove empty strings
          .map((src) => src.trim()) // Remove white spaces
          .map((src) => src.split(" ")[0]) // Separate the source from the size
          .filter(isLocalUrl), // Remove external references
      );
    }

    // Remove duplicates
    sources = [
      ...new Set(
        sources.filter((d) =>
          !src.startsWith("data:") && src.indexOf("{{") < 0
        ),
      ),
    ];

    // If "src" or "srcset" only have external references, skip handling
    if (sources.length === 0) return null;

    return new ImageAsset(sources, img);
  }

  #sources: string[];
  #el: Element;

  constructor(sources: string[], image: Element) {
    this.#sources = sources;
    this.#el = image;
  }

  async getWatchPaths(base: string): Promise<string[]> {
    const localDependencyPaths: Promise<string[]>[] = [];
    for (const src of this.#sources) {
      localDependencyPaths.push(getLocalDependencyPaths(join(base, src)));
    }
    return (await Promise.all(localDependencyPaths))
      .flatMap((path) => path); // Flatten result
  }

  async createFileObject(
    { base, pathPrefix }: CreateFileObjectParams,
  ): Promise<File[]> {
    // TODO(tjosepo): Find a way to avoid creating copies of the same image
    // when creating a bundle
    const files: File[] = [];

    for (const src of this.#sources) {
      const staticTag = "../static/";
      let i: number = src.indexOf(staticTag);
      let done = false;
      if (i > -1) {
        if (this.#el.getAttribute("src")?.match(src)) {
          i += staticTag.length - 1;
          this.#el.setAttribute("src", src.substring(i));
          done = true;
        }
      }

      const srcset = this.#el.getAttribute("srcset");
      if (srcset) {
        i = srcset.indexOf(staticTag);
        if (i > -1) {
          i += staticTag.length - 1;
          this.#el.setAttribute(
            "srcset",
            srcset?.replace(/.*\.\.\/static\//g, "/"),
          );
        }
      }
      if (done) {
        continue;
      }

      const flpath = join(base, src);
      const data = await Deno.readFile(flpath);
      const { name, prefix } = namePrefix(base, flpath);
      const [, _, extension] = src.match(/([^/]+)\.([\w]+)$/) ?? [];
<<<<<<< HEAD
      const dest = `${name}.${await md5(data)}.${extension}`;
=======
      const dest = `${name}.${md5(data)}.${extension}`;
>>>>>>> db21e0a (fix: serve mode issues and image asset path bug)

      if (this.#el.getAttribute("src")?.match(src)) {
        this.#el.setAttribute("src", join(prefix || pathPrefix, dest));
      }

      if (srcset?.includes(src)) {
        // TODO(tjosepo): Find a better way to replace the old src with the new
        // dest without only using `string.replace()`
        this.#el.setAttribute(
          "srcset",
          srcset.replace(src, posixPathJoin(prefix || pathPrefix, dest)),
        );
      }

      const info = await Deno.stat(flpath);
      files.push(
        Object.assign(new Blob([data]), {
          name: dest,
          lastModified: (info.mtime?.getTime() ?? 0) / 1000,
        }),
      );
    }

    return files;
  }
}

export function* extractReferencedAssets(
  doc: Document,
): Generator<Asset, void, void> {
  yield* extractReferencedScripts(doc);
  yield* extractReferencedStyleSheets(doc);
  yield* extractReferencedImages(doc);
}

function* extractReferencedScripts(
  doc: Document,
): Generator<Asset, void, void> {
  for (const s of qs(doc, "script")) {
    const asset = ScriptAsset.create(s);
    if (asset) yield asset;
  }
}

function* extractReferencedStyleSheets(
  doc: Document,
): Generator<Asset, void, void> {
  for (const link of qs(doc, "link")) {
    const asset = CssAsset.create(link);
    if (asset) yield asset;
  }
}

function* extractReferencedImages(
  doc: Document,
): Generator<Asset, void, void> {
  for (const img of [...qs(doc, "img"), ...qs(doc, "source")]) {
    const asset = ImageAsset.create(img);
    if (asset) yield asset;
  }
}
