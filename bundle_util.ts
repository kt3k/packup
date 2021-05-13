import { denoPlugin, resolve } from "./deps.ts";
import esbuildWasm from "./esbuild_wasm.js";
import * as esbuild from "https://deno.land/x/esbuild@v0.11.20/mod.js";

/*
let esbuildReady: null | Promise<void> = null;
function ensureEsbuildInialized() {
  if (esbuildReady) {
    return esbuildReady;
  }
  console.log("Using esbuild bundler");
  console.log("Initializing esbuild");
  const timeStarted = Date.now();
  return esbuildReady = esbuild.initialize({
    wasmURL: esbuildWasm,
    worker: false,
  }).then(() => {
    const timeEnded = Date.now();
    console.log(`Esbuild initialized in ${timeEnded - timeStarted}ms`);
  });
}
*/

export async function bundleByEsbuild(path: string): Promise<string> {
  //await ensureEsbuildInialized();

  const bundle = await esbuild.build({
    entryPoints: [resolve(path)],
    plugins: [denoPlugin()],
    bundle: true,
    write: false,
    outfile: 'bundle.js',
  });
  esbuild.stop();
  //console.log(bundle);

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
