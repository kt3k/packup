export {
  basename,
  dirname,
  fromFileUrl,
  join,
  relative,
  resolve,
  toFileUrl,
} from "https://deno.land/std/path/mod.ts";
import { join } from "https://deno.land/std/path/posix.ts";
export { join as posixPathJoin };
export { ensureDir } from "https://deno.land/std/fs/ensure_dir.ts";
export { parse as parseJsonC } from "https://deno.land/std/jsonc/mod.ts";
export { parse as parseFlags } from "https://deno.land/std/flags/mod.ts";
export { red } from "https://deno.land/std/fmt/colors.ts";
export { MuxAsyncIterator } from "https://deno.land/std/async/mux_async_iterator.ts";
export { walk } from "https://deno.land/std/fs/walk.ts";
export {
  denoLoaderPlugin,
  denoPlugins,
  denoResolverPlugin,
} from "https://deno.land/x/esbuild_deno_loader/mod.ts";
export { build, stop } from "https://deno.land/x/esbuild@v0.17.19/mod.js";
export type { CommonOptions, Plugin } from "https://deno.land/x/esbuild/mod.js";
export { exists } from "https://deno.land/std/fs/mod.ts";

export {
  Document,
  DOMParser,
  Element,
} from "https://deno.land/x/deno_dom@v0.1.34-alpha/deno-dom-wasm.ts";

export { opn } from "https://raw.githubusercontent.com/hashrock/deno-opn/b358e4c7df5d1c6d5e634d2730ca491ba6062782/opn.ts";
export { serve as serveIterable } from "https://deno.land/x/iterable_file_server@v0.2.0/mod.ts";

export const NAME = "packup";
export const VERSION = "v0.2.3";

import { crypto } from "https://deno.land/std/crypto/mod.ts";
import { toHashString } from "https://deno.land/std/crypto/to_hash_string.ts";

export const md5sum = async function (data: string | ArrayBuffer) {
  return toHashString(
    await crypto.subtle.digest(
      "MD5",
      typeof data === "string" ? new TextEncoder().encode(data) : data,
    ),
  );
};
