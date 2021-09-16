import { ensureDir } from "./deps.ts";
import { installWasm, wasmCacheDir, wasmPath } from "./install_util.ts";

const path = wasmPath();

await ensureDir(wasmCacheDir());
try {
  await Deno.lstat(path);
} catch (e) {
  if (e.name === "NotFound") {
    await installWasm();
    Deno.exit(0);
  }
  throw e;
}
