import { resolve, toFileUrl } from "./deps.ts";
import { build, stop } from "https://deno.land/x/esbuild@v0.14.51/mod.js";
import { denoPlugin } from "https://deno.land/x/esbuild_deno_loader@0.5.2/mod.ts";

export async function bundleByEsbuild(
  path: string,
): Promise<string> {
  const importMapFile = getImportMap();
  let importMapURL: URL | undefined;
  if (importMapFile) {
    importMapURL = toFileUrl(resolve(importMapFile));
  }

  const bundle = await build({
    entryPoints: [toFileUrl(resolve(path)).href],
    plugins: [
      denoPlugin({
        importMapURL,
      }),
    ],
    bundle: true,
    write: false,
  });

  stop();

  return bundle.outputFiles![0].text;
}

let _importMap: string | undefined;

export function setImportMap(importMap: string) {
  _importMap = importMap;
}

export function getImportMap() {
  return _importMap;
}
