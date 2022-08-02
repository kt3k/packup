import { NAME, VERSION } from "./deps.ts";

console.log(`Installing ${NAME} command`);
const p = Deno.run({
  cmd: [
    Deno.execPath(),
    "install",
    "--no-check",
    "-qAf",
    `https://deno.land/x/${NAME}@${VERSION}/cli.ts`,
  ],
});

Deno.exit((await p.status()).code);
