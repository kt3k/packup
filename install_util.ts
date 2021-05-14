import { join, NAME } from "./deps.ts";

function denoRoot(os = Deno.build.os): string {
  if (os === "windows") {
    return join(Deno.env.get("USERPROFILE")!, ".deno");
  }
  return join(Deno.env.get("HOME")!, ".deno");
}

export function wasmCacheDir(os = Deno.build.os): string {
  return join(denoRoot(os), `${NAME}-cache`);
}
