import { basename, dirname, ensureDir, join } from "./deps.ts";
import { md5 } from "./util.ts";
import { logger } from "./logger_util.ts";
import { byteSize } from "./util.ts";
import { bundleByEsbuild } from "./bundle_util.ts";
import * as esbuild from "https://deno.land/x/esbuild@v0.14.50/mod.js";

const bx = /\/\/[ \t]*!bundle=([^\s]+)\s*[\r\n]+[^;]+['"]([^'"]+)['"];[\r\n]+/g;

export const bundlet = async function (
  flpath: string,
  pathPrefix: string,
  distDir?: string,
): Promise<{ options?: any; plugins?: esbuild.Plugin[] }> {
  if (!distDir) {
    return {};
  }
  const body = await Deno.readTextFile(flpath);
  const bm = body.matchAll(bx);
  const from = dirname(flpath);
  const x: any = {};
  const dirs: any = {};
  const names: string[] = [];

  for (const bi of bm) {
    if (bi[1] === "off") {
      const flname = basename(bi[2]);
      if (!x[flname] && !flname.match(/\.ts$/)) {
        x[flname] = flname;
        names.push(flname);
      }
      continue;
    }
    if (!bi[1]) {
      continue;
    }
    const src = join(from, bi[2]);
    let [, name] = bi[2].match(/([^/]+)([.]\w+)$/) || [];
    const data = await bundleByEsbuild(src, {
      platform: "browser",
      format: "esm",
    });
    let base = join(distDir, pathPrefix, dirname(bi[2]));
    if (bi[1] !== "module" && !bi[1].endsWith("/")) {
      name = basename(bi[1]);
      bi[1] = dirname(bi[1]);
    }
    const customizedDir = bi[1].startsWith("/");
    if (customizedDir) {
      base = join(distDir, bi[1].substr(1));
    }
    const jsname = `${name}.${md5(data)}.js`;
    const flpath = join(base, jsname);
    let exists = false;
    try {
      exists = Deno.statSync(flpath).isFile;
    } catch {
      // skips
    }
    if (!exists) {
      await ensureDir(base);
      logger.log("Writing", flpath, byteSize(data.length));
      await Deno.writeTextFile(flpath, data);
    }
    const flname = basename(bi[2]);
    if (!x[flname]) {
      x[flname] = jsname;
      names.push(flname);
      if (customizedDir) {
        dirs[flname] = bi[1].substr(1) || "./";
      }
      // console.log(bi.index, bi[0], bi[1], bi[2]);
    }
  }
  if (names.length === 0) {
    return {};
  }
  const ignores = (): esbuild.Plugin => ({
    name: "bundlet-keep-imports",
    setup(build: any) {
      // console.debug(x);
      build.onResolve({
        filter: new RegExp(names.join("|").replace(/\./g, "[.]")),
      }, (args: any) => {
        const base = dirname(args.path);
        const name = basename(args.path);
        let target = join(args.resolveDir, dirs[name] || base, x[name] || name);
        if (!/^[\/.]/.test(target)) {
          target = `./${target}`;
        }
        return { path: target, external: true };
      });
    },
  });

  return {
    plugins: [ignores()],
    options: { platform: "browser", format: "esm" },
  };
};
