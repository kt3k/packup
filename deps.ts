export { createHash } from "https://deno.land/std@0.95.0/hash/mod.ts";
export {
  basename,
  dirname,
  fromFileUrl,
  join,
} from "https://deno.land/std@0.95.0/path/mod.ts";
export { ensureDir } from "https://deno.land/std@0.95.0/fs/ensure_dir.ts";
export { parse as parseFlags } from "https://deno.land/std@0.95.0/flags/mod.ts";
export { red } from "https://deno.land/std@0.95.0/fmt/colors.ts";

export {
  Document,
  DOMParser,
  Element,
} from "https://deno.land/x/deno_dom@v0.1.9-alpha/deno-dom-wasm.ts";

export { serve as serveIterable } from "https://deno.land/x/iterable_file_server@v0.1.4/mod.ts";
