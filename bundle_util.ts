import { resolve, toFileUrl } from "./deps.ts";
import { logger } from "./logger_util.ts";
import { load } from "https://deno.land/x/esbuild_loader@v0.12.8/mod.ts";
import { denoPlugin } from "./esbuild_deno_loader/mod.ts";

export async function bundleByEsbuild(
  path: string,
  wasmPath: string,
): Promise<string> {
  const { build } = await load(wasmPath);

  const bundle = await build({
    entryPoints: [toFileUrl(resolve(path)).href],
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
