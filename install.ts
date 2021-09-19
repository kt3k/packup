import { ensureDir, NAME, VERSION } from "./deps.ts";
import { installWasm, wasmCacheDir } from "./install_util.ts";

await ensureDir(wasmCacheDir());

await installWasm();

console.log(`Installing ${NAME} command`);
const p = Deno.run({
  cmd: [
    Deno.execPath(),
    "install",
    "--unstable",
    "--no-check",
    "-qAf",
    `https://deno.land/x/${NAME}@${VERSION}/cli.ts`,
  ],
});

Deno.exit((await p.status()).code);
