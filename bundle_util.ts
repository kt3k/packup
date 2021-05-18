import { denoPlugin, esbuild, resolve } from "./deps.ts";
import { logger } from "./logger_util.ts";

let esbuildReady: null | Promise<void> = null;
function ensureEsbuildInialized() {
  if (esbuildReady) {
    return esbuildReady;
  }
  logger.debug("Using esbuild bundler");
  const timeStarted = Date.now();
  return esbuildReady = esbuild.initialize({
    // Note: this is dummy url
    // See vendor/esbuild_build.js for details
    wasmURL: "https://unpkg.com/esbuild-wasm@0.11.19/esbuild.wasm",
    worker: false,
  }).then(() => {
    const timeEnded = Date.now();
    logger.debug(`Esbuild initialized in ${timeEnded - timeStarted}ms`);
  });
}

export async function bundleByEsbuild(path: string): Promise<string> {
  await ensureEsbuildInialized();

  const bundle = await esbuild.build({
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
