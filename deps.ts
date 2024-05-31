export { crypto } from "jsr:@std/crypto@0.224.0/crypto";
export { parseArgs } from "jsr:@std/cli@0.224.4/parse-args";
export {
  basename,
  dirname,
  fromFileUrl,
  join,
  relative,
  resolve,
  toFileUrl,
} from "jsr:@std/path@0.225.1";
export { join as posixPathJoin } from "jsr:@std/path@0.225.1/posix";
export { parse as parseJsonC } from "jsr:@std/jsonc@0.224.0";
export { ensureDir, exists, walk } from "jsr:@std/fs@0.229.1";
export { red } from "jsr:@std/fmt@0.225.2/colors";
export { MuxAsyncIterator } from "jsr:@std/async@0.224.1";

export { denoPlugins } from "https://deno.land/x/esbuild_deno_loader@0.8.1/mod.ts";
export { build, stop } from "https://deno.land/x/esbuild@v0.17.19/mod.js";

export {
  Document,
  DOMParser,
  Element,
} from "https://deno.land/x/deno_dom@v0.1.34-alpha/deno-dom-wasm.ts";

export { opn } from "https://raw.githubusercontent.com/hashrock/deno-opn/b358e4c7df5d1c6d5e634d2730ca491ba6062782/opn.ts";
export { serve as serveIterable } from "https://deno.land/x/iterable_file_server@v0.2.0/mod.ts";

export const NAME = "packup";
export const VERSION = "v0.2.5";
