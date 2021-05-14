import { join, NAME } from "./deps.ts";

function homedir(os: typeof Deno.build.os): string {
  if (os === "windows") {
    return Deno.env.get("USERPROFILE")!;
  }
  return Deno.env.get("HOME")!;
}

export function wasmCacheDir(os = Deno.build.os, getHomeDir = homedir): string {
  return join(getHomeDir(os), '.deno', `${NAME}-cache`);
}
