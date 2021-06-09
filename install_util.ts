import { join, NAME } from "./deps.ts";

function homedir(os: typeof Deno.build.os): string {
  if (os === "windows") {
    return Deno.env.get("USERPROFILE")!;
  }
  return Deno.env.get("HOME")!;
}

export function wasmCacheDir(os = Deno.build.os, getHomeDir = homedir): string {
  return join(getHomeDir(os), ".deno", NAME);
}

export function wasmPath(): string {
  return join(wasmCacheDir(), "esbuild.wasm");
}

export async function installWasm() {
  const wasmUrl =
    `https://deno.land/x/esbuild_loader@v0.12.8/vendor/esbuild.wasm`;

  console.log(`Downloading esbuild wasm from ${wasmUrl}`);

  const res = await fetch(wasmUrl);
  const bytes = new Uint8Array(await res.arrayBuffer());
  const size = (bytes.byteLength / 1024 / 1024).toFixed(2);
  await Deno.writeFile(wasmPath(), bytes);
  console.log(`Saved esbuild wasm (${size}MB) at the path ${wasmPath()}`);
}
