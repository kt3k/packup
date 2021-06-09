export { createHash } from "https://deno.land/std@0.95.0/hash/mod.ts";
export {
  basename,
  dirname,
  fromFileUrl,
  join,
  relative,
  resolve,
} from "https://deno.land/std@0.95.0/path/mod.ts";
export { ensureDir } from "https://deno.land/std@0.95.0/fs/ensure_dir.ts";
export { parse as parseFlags } from "https://deno.land/std@0.95.0/flags/mod.ts";
export { red } from "https://deno.land/std@0.95.0/fmt/colors.ts";
export { MuxAsyncIterator } from "https://deno.land/std@0.95.0/async/mux_async_iterator.ts";
export { walk } from "https://deno.land/std@0.97.0/fs/walk.ts";

export {
  Document,
  DOMParser,
  Element,
} from "https://deno.land/x/deno_dom@v0.1.9-alpha/deno-dom-wasm.ts";

export { opn } from "https://raw.githubusercontent.com/hashrock/deno-opn/b358e4c7df5d1c6d5e634d2730ca491ba6062782/opn.ts";

export const NAME = "packup";
export const VERSION = "v0.0.11";
