export { createHash } from "https://deno.land/std@0.95.0/hash/mod.ts";
export {
  basename,
  dirname,
  fromFileUrl,
  join,
  resolve,
} from "https://deno.land/std@0.95.0/path/mod.ts";
export { ensureDir } from "https://deno.land/std@0.95.0/fs/ensure_dir.ts";
export { parse as parseFlags } from "https://deno.land/std@0.95.0/flags/mod.ts";
export { red } from "https://deno.land/std@0.95.0/fmt/colors.ts";

export {
  Document,
  DOMParser,
  Element,
} from "https://deno.land/x/deno_dom@v0.1.9-alpha/deno-dom-wasm.ts";

// @deno-types="https://unpkg.com/esbuild-wasm@0.11.19/esm/browser.d.ts"
import * as esbuild from "./vendor/esbuild_wasm.js";
export { esbuild };
export { denoPlugin } from "https://raw.githubusercontent.com/lucacasonato/esbuild_deno_loader/fa2219c3df9494da6c33e3e4dffb1a33b5cc0345/mod.ts";

export const NAME = "packup";
export const VERSION = "v0.0.6";
