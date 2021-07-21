import type * as esbuild from "https://deno.land/x/esbuild@v0.12.9/mod.d.ts";

export function packupCssPlugin(): esbuild.Plugin {
  return {
    name: "packup-css",
    setup(build) {
      build.onResolve({ filter: /\.css$/ }, (args) => {
        return null;
      });
    },
  };
}
