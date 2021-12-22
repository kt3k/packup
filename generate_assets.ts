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
} from "./deps.ts";
import { decoder, encoder, getLocalDependencyPaths, md5, qs } from "./util.ts";
import { wasmPath } from "./install_util.ts";
import { bundleByEsbuild } from "./bundle_util.ts";
import { logger } from "./logger_util.ts";
import { compile as compileSass } from "./sass_util.ts";
import type { File } from "./types.ts";

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

  const assets = [...htmlAsset.extractReferencedAssets()];

  if (opts.insertLivereloadScript) {
    htmlAsset.insertScriptTag(
      `http://localhost:${opts.livereloadPort!}/livereload.js`,
    );
  }

  const generator = (async function* () {
    for (const a of assets) {
      // TODO(kt3k): These can be concurrent
      yield await a.createFileObject({ pageName, base, pathPrefix });
    }

    // This needs to be the last.
    yield htmlAsset.createFileObject({ pageName, base, pathPrefix });
    if (opts.mainAs404) {
      yield Object.assign(
        await htmlAsset.createFileObject({ pageName, base, pathPrefix }),
        { name: "404" },
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

  while (true) {
    for await (const file of assets) {
      yield file;
    }
    const watcher = Deno.watchFs(watchPaths);
    for await (const e of watcher) {
      logger.log("Changed: " + e.paths.join(""));
      break;
      // watcher.close();
    }
    logger.log("Rebuilding");
    await new Promise<void>((resolve) => setTimeout(() => resolve(), 100));
    [assets, watchPaths] = await generateAssets(path, opts);
  }
}

type CreateFileObjectParams = {
  pageName: string;
  base: string;
  pathPrefix: string;
};

type Asset = {
  getWatchPaths(base: string): Promise<string[]>;
  createFileObject(params: CreateFileObjectParams): Promise<File>;
};

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
    return Promise.resolve(Object.assign(
      new Blob([encoder.encode(this.#doc.body.parentElement!.outerHTML)]),
      { name: this.#filename },
    ));
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
    { pageName, base, pathPrefix }: CreateFileObjectParams,
  ): Promise<File> {
    const data = await Deno.readFile(join(base, this._href));
    this._dest = `${pageName}.${md5(data)}.css`;
    this._el.setAttribute("href", join(pathPrefix, this._dest));
    return Object.assign(new Blob([data]), { name: this._dest });
  }
}

/** ScssAsset represents a <link rel="stylesheet"> tag
 * with href having .scss extension in the html */
class ScssAsset extends CssAsset {
  // TODO(kt3k): implement getWatchPaths correctly
  async createFileObject(
    { pageName, base, pathPrefix }: CreateFileObjectParams,
  ): Promise<File> {
    const scss = await Deno.readFile(join(base, this._href));
    this._dest = `${pageName}.${md5(scss)}.css`;
    this._el.setAttribute("href", join(pathPrefix, this._dest));
    return Object.assign(new Blob([await compileSass(decoder.decode(scss))]), {
      name: this._dest,
    });
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
    return await getLocalDependencyPaths(join(base, this.#src));
  }

  async createFileObject({
    pageName,
    base,
    pathPrefix,
  }: CreateFileObjectParams): Promise<File> {
    const path = join(base, this.#src);
    const data = await bundleByEsbuild(path, wasmPath());
    this.#dest = `${pageName}.${md5(data)}.js`;
    this.#el.setAttribute("src", join(pathPrefix, this.#dest));
    return Object.assign(new Blob([data]), { name: this.#dest });
  }
}

/** ImageAsset represents a <img> tag in the html */
class ImageAsset implements Asset {
  static create(img: Element): ImageAsset | null {
    const src = img.getAttribute("src");
    if (!src) {
      logger.warn(
        "<img> tag doesn't have src attribute",
      );
      return null;
    }
    if (!src || src.startsWith("http://") || src.startsWith("https://")) {
      // If "src" starts with http(s):// schemes, we consider these as
      // external reference. So skip handling these
      return null;
    }
    return new ImageAsset(src, img);
  }

  #src: string;
  #dest?: string;
  #el: Element;
  #extension: string;

  constructor(src: string, image: Element) {
    this.#src = src;
    this.#el = image;
    [, this.#extension] = src.match(/\.([\w]+)$/) ?? [];
  }

  async getWatchPaths(base: string): Promise<string[]> {
    return await getLocalDependencyPaths(join(base, this.#src));
  }

  async createFileObject(
    { pageName, base, pathPrefix }: CreateFileObjectParams,
  ): Promise<File> {
    const data = await Deno.readFile(join(base, this.#src));
    this.#dest = `${pageName}.${md5(data)}.${this.#extension}`;
    this.#el.setAttribute("src", join(pathPrefix, this.#dest));
    return Object.assign(new Blob([data]), { name: this.#dest });
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
  for (const img of qs(doc, "img")) {
    const asset = ImageAsset.create(img);
    if (asset) yield asset;
  }
}
