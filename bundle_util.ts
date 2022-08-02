import { resolve, toFileUrl } from "./deps.ts";
import * as esbuild from 'https://deno.land/x/esbuild@v0.14.50/mod.js'
import { denoPlugin } from "./vendor/esbuild_deno_loader/mod.ts";

export async function bundleByEsbuild(
  path: string,
  options?: any,
  plugins?: esbuild.Plugin[],
): Promise<string> {
  if (!plugins) plugins = [];
  plugins.push(denoPlugin());
  const opts = Object.assign({
    entryPoints: [toFileUrl(resolve(path)).href],
    plugins,
    minify: true,
    bundle: true,
    write: false,
    format: 'esm',
    platform: 'browser',
  }, options || {});

  const result = await esbuild.build(opts);
  return result.outputFiles![0].text;
};
