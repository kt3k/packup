import { denoPlugin, esbuild, resolve } from "./deps.ts";

let esbuildReady: null | Promise<void> = null;
function ensureEsbuildInialized() {
  if (esbuildReady) {
    return esbuildReady;
  }
  console.log("Using esbuild bundler");
  return esbuildReady = esbuild.initialize({
    wasmURL: "https://unpkg.com/esbuild-wasm@0.11.19/esbuild.wasm",
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
