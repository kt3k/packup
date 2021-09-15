/**
 * This file contains the functions which create assets from the given paths.
 * An asset is the unit of build target.
 *
 * There are 4 types of assets
 * - HtmlAsset
 * - CssAsset
 * - ScssAsset
 * - ScriptAsset - represents javascript or typescript
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
};

/**
 * Generates assets from the given entrypoint path (html).
 * Also returns watch paths when `watchPaths` option is true.
 *
 * Used both in `packup build` and `packup serve`.
 */
export async function generateAssets(
  path: string,
  opts: GenerateAssetsOptions = {},
): Promise<[AsyncGenerator<File, void, void>, string[]]> {
  const buildStarted = Date.now();
  const htmlAsset = await HtmlAsset.create(path);

  const assets = [...htmlAsset.extractReferencedAssets()];

  if (opts.insertLivereloadScript) {
    htmlAsset.insertScriptTag(
      `http://localhost:${opts.livereloadPort!}/livereload.js`,
    );
  }

  const generator = (async function* () {
    for (const a of assets) {
      // TODO(kt3k): These can be concurrent
      yield await a.createFileObject(htmlAsset.pageName, htmlAsset.base);
    }

    // This needs to be the last.
    yield htmlAsset.createFileObject(htmlAsset.pageName, htmlAsset.base);
    if (opts.mainAs404) {
      yield Object.assign(
        await htmlAsset.createFileObject(htmlAsset.pageName, htmlAsset.base),
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
  opts: GenerateAssetsOptions = {},
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

type Asset = {
  getWatchPaths(base: string): Promise<string[]>;
  createFileObject(
    pageName: string,
    base: string,
  ): Promise<File>;
};

/**
 * Build asset which represents the entrypoint html file.
 */
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

  createFileObject(
    _pageName: string,
    _base: string,
  ) {
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

class CssAsset implements Asset {
  static create(link: Element): CssAsset | null {
    const href = link.getAttribute("href");
    if (link.getAttribute("rel") === "stylesheet" && href) {
      if (href.endsWith(".scss")) {
        return new ScssAsset(href, link);
      }
      return new CssAsset(href, link);
    }
    return null;
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

  async createFileObject(pageName: string, base: string): Promise<File> {
    const data = await Deno.readFile(join(base, this._href));
    this._dest = `${pageName}.${md5(data)}.css`;
    this._el.setAttribute("href", this._dest);
    return Object.assign(new Blob([data]), { name: this._dest });
  }
}

class ScssAsset extends CssAsset {
  // TODO(kt3k): implement getWatchPaths correctly
  async createFileObject(pageName: string, base: string): Promise<File> {
    const scss = await Deno.readFile(join(base, this._href));
    this._dest = `${pageName}.${md5(scss)}.css`;
    this._el.setAttribute("href", this._dest);
    return Object.assign(new Blob([await compileSass(decoder.decode(scss))]), { name: this._dest });
  }
}

class ScriptAsset implements Asset {
  static create(script: Element): ScriptAsset | null {
    const src = script.getAttribute("src");
    if (src) {
      return new ScriptAsset(src, script);
    }
    return null;
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

  async createFileObject(
    pageName: string,
    base: string,
  ): Promise<File> {
    const path = join(base, this.#src);
    const data = await bundleByEsbuild(path, wasmPath());
    // TODO(kt3k): Maybe align this asset naming to parcel.
    // Note: parcel uses a shorter name.
    this.#dest = `${pageName}.${md5(data)}.js`;
    this.#el.setAttribute("src", this.#dest);
    return Object.assign(new Blob([data]), { name: this.#dest });
  }
}

export function* extractReferencedAssets(
  doc: Document,
): Generator<Asset, void, void> {
  yield* extractReferencedScripts(doc);
  yield* extractReferencedStyleSheets(doc);
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
