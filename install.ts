import { ensureDir, join, NAME, VERSION } from "./deps.ts";
import { wasmCacheDir, wasmPath } from "./install_util.ts";

await ensureDir(wasmCacheDir());

const wasmUrl = `https://deno.land/x/${NAME}@${VERSION}/esbuild.wasm`;

console.log(`Downloading esbuild wasm from ${wasmUrl}`);

const res = await fetch(wasmUrl);
const bytes = new Uint8Array(await res.arrayBuffer());
const size = (bytes.byteLength / 1024 / 1024).toFixed(2);
await Deno.writeFile(wasmPath(), bytes);
console.log(`Saved esbuild wasm (${size}MB) at the path ${wasmPath()}`);

console.log(`Installing ${NAME} command`);
const p = Deno.run({
  cmd: [
    Deno.execPath(),
    "install",
    "--unstable",
    "-qAf",
    `https://deno.land/x/${NAME}@${VERSION}/cli.ts`,
  ],
});

Deno.exit((await p.status()).code);
