import { resolve, toFileUrl } from "./deps.ts";
import * as esbuild from "https://deno.land/x/esbuild@v0.15.11/mod.js";
import { denoPlugin } from "./vendor/esbuild_deno_loader/mod.ts";
import * as npmLocal from "./npm_local.ts";

export async function bundleByEsbuild(
  path: string,
  options?: esbuild.BuildOptions,
  plugins?: esbuild.Plugin[],
): Promise<string> {
  const importMapFile = getImportMap();
  let importMapURL: URL | undefined;
  if (importMapFile) {
    importMapURL = toFileUrl(resolve(importMapFile));
  }

  if (!plugins) plugins = [];
  plugins.push(npmLocal.resolve);
  plugins.push(denoPlugin({
    importMapURL,
  }));
  const entryPoint = /^https?:\/\//.test(path)
    ? path
    : toFileUrl(resolve(path)).href;
  const opts = Object.assign({
    entryPoints: [entryPoint],
    plugins,
    minify: true,
    bundle: true,
    write: false,
    format: "esm",
    platform: "browser",
  }, options || {});

  try {
    const bundle = await esbuild.build(opts);
    return bundle.outputFiles![0].text;
  } catch (err) {
    return err?.toString?.() || "";
  }
}

let _importMap: string | undefined;

export function setImportMap(importMap: string) {
  _importMap = importMap;
}

export function getImportMap() {
  return _importMap;
}
