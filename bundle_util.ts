import { resolve, toFileUrl } from "./deps.ts";
import { logger } from "./logger_util.ts";
import { build, load } from "https://deno.land/x/esbuild_loader@v0.12.8/mod.ts";
import { denoPlugin } from "./vendor/esbuild_deno_loader/mod.ts";

type Builder = typeof build;
let b: Builder | null = null;
async function loadBuilder(wasmPath: string): Promise<Builder> {
  if (b) {
    return b;
  }
  const start = Date.now();
  const { build } = await load(wasmPath);
  logger.debug(`Esbuild loaded in ${Date.now() - start}ms`);
  b = build;
  return b;
}
export async function bundleByEsbuild(
  path: string,
  wasmPath: string,
): Promise<string> {
  const build = await loadBuilder(wasmPath);

  const bundle = await build({
    entryPoints: [toFileUrl(resolve(path)).href],
    plugins: [denoPlugin()],
    bundle: true,
    minfiy: true,
  });

  return bundle.outputFiles![0].text;
}
