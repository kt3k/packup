import {
  basename,
  dirname,
  Document,
  DOMParser,
  Element,
  join,
} from "./deps.ts";
import { decoder, encoder, getLocalDependencyPaths, md5, qs } from "./util.ts";
import { bundleByEsbuild, bundleBySwc } from "./bundle_util.ts";
import type { File } from "./types.ts";

type GenerateAssetsOptions = {
  watchPaths?: boolean;
  bundler?: "swc" | "esbuild";
};

/**
 * Generates assets from the given entrypoint path (html).
 * Also returns watch paths when `watchPaths` option is true.
 */
export async function generateAssets(
  path: string,
  opts: GenerateAssetsOptions = {},
): Promise<[AsyncGenerator<File, void, void>, string[]]> {
  const timeStarted = Date.now();
  const html = decoder.decode(await Deno.readFile(path));
  const base = dirname(path);
  const filename = basename(path);

  if (!filename.endsWith(".html")) {
    throw new Error(`Entrypoint needs to be an html file: ${path}`);
  }

  const pageName = filename.replace(/\.html$/, "");

  if (!pageName) {
    throw new Error(`Bad entrypoint name: ${path}`);
  }

  const doc = new DOMParser().parseFromString(html, "text/html")!;
  const assets = [...extractReferencedAssets(doc)];

  const generator = (async function* () {
    for (const a of assets) {
      yield await a.createFileObject(pageName, base, { bundler: opts.bundler });
    }

    yield Object.assign(
      new Blob([encoder.encode(doc.body.parentElement!.outerHTML)]),
      { name: filename },
    );
    const timeEnded = Date.now();
    console.log(`Built in ${timeEnded - timeStarted}ms`);
  })();

  const watchPaths = opts.watchPaths
    ? (await Promise.all(assets.map((a) => a.getWatchPaths(base)))).flat()
    : [];

  return [generator, [path, ...watchPaths]];
}

export async function* watchAndGenAssets(
  path: string,
  opts: GenerateAssetsOptions = {},
): AsyncGenerator<File, void, void> {
  let [assets, watchPaths] = await generateAssets(path, {
    watchPaths: true,
    ...opts,
  });

  while (true) {
    for await (const file of assets) {
      yield file;
    }
    const watcher = Deno.watchFs(watchPaths);
    for await (const e of watcher) {
      console.log("Changed: " + e.paths.join(""));
      break;
      // watcher.close();
    }
    console.log("Rebuilding");
    [assets, watchPaths] = await generateAssets(path, { watchPaths: true, ...opts });
  }
}

type CreateFileObjectOptions = {
  bundler?: "swc" | "esbuild";
};

type Asset = {
  getWatchPaths(base: string): Promise<string[]>;
  createFileObject(
    pageName: string,
    base: string,
    opts: CreateFileObjectOptions,
  ): Promise<File>;
};

class CssAsset implements Asset {
  static create(link: Element): CssAsset | null {
    const href = link.getAttribute("href");
    if (link.getAttribute("rel") === "stylesheet" && href) {
      return new CssAsset(href, link);
    }
    return null;
  }

  #el: Element;
  #href: string;
  #dest?: string;
  constructor(href: string, link: Element) {
    this.#el = link;
    this.#href = href;
  }

  getWatchPaths(base: string): Promise<string[]> {
    return Promise.resolve([join(base, this.#href)]);
  }

  async createFileObject(pageName: string, base: string): Promise<File> {
    const data = await Deno.readFile(join(base, this.#href));
    this.#dest = `${pageName}.${md5(data)}.css`;
    this.#el.setAttribute("href", this.#dest);
    return Object.assign(new Blob([data]), { name: this.#dest });
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
    { bundler }: CreateFileObjectOptions,
  ): Promise<File> {
    const path = join(base, this.#src);
    const data = bundler === "swc"
      ? await bundleBySwc(path)
      : await bundleByEsbuild(path);
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
