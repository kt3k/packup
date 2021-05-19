import { ensureDir } from "./deps.ts";
import { wasmCacheDir, wasmPath } from "./install_util.ts";

await ensureDir(wasmCacheDir());
Deno.writeFile(wasmPath(), await Deno.readFile("vendor/esbuild.wasm"));
