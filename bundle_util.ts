import { denoPlugin, esbuild, resolve } from "./deps.ts";
import esbuildWasm from "./esbuild_wasm.js";

let esbuildReady: null | Promise<void> = null;
function ensureEsbuildInialized() {
  if (esbuildReady) {
    return esbuildReady;
  }
  console.log("Using esbuild bundler");
  return esbuildReady = esbuild.initialize({
    wasmURL: esbuildWasm,
    worker: false,
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
    console.log("Using swc bundler");
    usingSwcLogged = true;
  }
  const res = await Deno.emit(path, {
    bundle: "classic",
    check: false,
  });
  return res.files["deno:///bundle.js"];
}
