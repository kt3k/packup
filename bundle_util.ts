import { resolve } from "./deps.ts";
import { logger } from "./logger_util.ts";
import { load } from "https://deno.land/x/esbuild_loader@v0.12.8/mod.ts";
import { denoPlugin } from "https://raw.githubusercontent.com/lucacasonato/esbuild_deno_loader/fa2219c3df9494da6c33e3e4dffb1a33b5cc0345/mod.ts";

export async function bundleByEsbuild(
  path: string,
  wasmPath: string,
): Promise<string> {
  const { build } = await load(wasmPath);

  const bundle = await build({
    entryPoints: [resolve(path)],
    plugins: [denoPlugin()],
    bundle: true,
  });

  return bundle.outputFiles![0].text;
}

let usingSwcLogged = false;
export async function bundleBySwc(path: string): Promise<string> {
  if (!usingSwcLogged) {
    logger.debug("Using swc bundler");
    usingSwcLogged = true;
  }
  const res = await Deno.emit(path, {
    bundle: "classic",
    check: false,
  });
  return res.files["deno:///bundle.js"];
}
