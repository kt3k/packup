import { DOMParser, Element } from "https://deno.land/x/deno_dom@v0.1.9-alpha/deno-dom-wasm.ts";
// import { join } from "https://deno.land/std@0.95.0/path/mod.ts";
import type { File } from "./types.ts";

const decoder = new TextDecoder();
const encoder = new TextEncoder();

export async function *generateAssets(path: string): AsyncGenerator<File, void, void> {
  const html = decoder.decode(await Deno.readFile(path));

  yield Object.assign(new Blob([encoder.encode(html)]), { name: "index.html" });
}
