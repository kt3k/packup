import { basename, dirname, ensureDir, join, relative } from "./deps.ts";
import { md5 } from "./util.ts";
import { logger } from "./logger_util.ts";
import { byteSize } from "./util.ts";
import { bundleByEsbuild } from "./bundle_util.ts";
import { denoPlugin } from "./vendor/esbuild_deno_loader/mod.ts";
import * as esbuild from "https://deno.land/x/esbuild@v0.15.7/mod.js";
import * as npmLocal from "./npm_local.ts";

const bx =
  /\/\/[ \t]*!bundle=([^\r\n]+)\s*[\r\n]+\s*(?:export|import)[^;]+['"]([^'"]+)['"]\s*;\s*/g;
const urlpath = /^https?:\/\//;
export const fm: { [key: string]: string } = {};

function urlSrc(u: string) {
  return `/${
    u.replace(/[:]\/\//g, "/").replace(/:\d+/, "").replace(
      /^http\/localhost\//,
      "npm/",
    ).replace(/[?#].*$/, "")
  }`;
}

function namesFilter(names: Array<string>) {
  return new RegExp(
    `${names.map((v) => v.replace(/([\[\]\{\}.$?+])/g, "[\\$1]")).join("$|")}$`,
  );
}

export async function confRules(
  body: string,
  ctx: {
    flpath: string;
    pathPrefix: string;
    distDir: string;
    mappings?: { [name: string]: string } | undefined;
    fileFree?: { [name: string]: string } | undefined;
  },
) {
  const { flpath, pathPrefix, distDir, mappings, fileFree } = ctx;
  const bm = body.matchAll(bx);
  const from = dirname(flpath);
  const x: { [name: string]: string } = {};
  const dirs: { [name: string]: string } = {};
  const names: string[] = [];

  if (mappings) {
    for (const k in mappings) {
      names.push(k);
    }
  }

  for (const bi of bm) {
    const isNPM = npmLocal.validSrc(bi[2]);
    if (isNPM) {
      if (bi[1] === "off") {
        bi[1] = "module";
      }
      bi[2] = npmLocal.resolveSrc(bi[2]);
    }
    let mx: { [name: string]: string } | undefined;
    if (bi[1].startsWith("module:")) {
      const j = bi[1].indexOf(":");
      const mapping = bi[1].substring(j + 1).match(
        /^\{[ \t]*([^=]+(=[ \t]*[^,\s\}]+)?([ \t]*,[ \t]*[^=]+(=[ \t]*[^,\s\}]+)?)*)[ \t]*\}/,
      );
      bi[1] = bi[1].substring(0, j);
      if (mapping) {
        mx = {};
        mapping[1].replace(/\s+/g, "").split(",").map((v) => v.split("="))
          .forEach((v) => {
            const k = v[0].replace(/\.js$/, "");
            if (mx) mx[`${k}.js`] = v[1];
          });
      }
    }

    const isURL = urlpath.test(bi[2]);
    if (isURL && bi[1] === "off") {
      const flname = basename(bi[2]);
      fm[flname.replace(/[.]js$/, "")] = bi[2];
      if (!x[flname] && !flname.match(/\.ts$/)) {
        x[flname] = "off";
        names.push(flname);
      }
      continue;
    }
    if (!bi[1]) {
      continue;
    }
    const src = isURL ? bi[2] : join(from, bi[2]);
    let [, name] = bi[2].match(/([^/]+)([.]\w+)$/) || [];
    if (isURL && bi[1] == "module") {
      bi[1] = urlSrc(bi[2]);
    }
    let data = "";
    let { options, plugins } = await bundlet(src, pathPrefix, distDir, mx);
    if (!plugins) plugins = [];
    plugins.concat(npmLocal.resolve, denoPlugin());
    data = await bundleByEsbuild(src, options, plugins);

    let base = join(
      distDir,
      pathPrefix,
      dirname(flpath.startsWith("src") ? relative("src", flpath) : flpath),
      dirname(bi[2]),
    );
    if (bi[1] !== "module" && !bi[1].endsWith("/")) {
      name = basename(bi[1]);
      bi[1] = dirname(bi[1]);
    }
    const customizedDir = bi[1].startsWith("/");
    if (customizedDir) {
      base = join(distDir, bi[1].substring(1));
    }

    const key = name.replace(/[.](tsx?|m?js)$/, "");
    const jsname = `${key}.${md5(data)}.js`;
    const flSrc = join(base, jsname);
    fm[key] = `/${relative(distDir, flSrc)}`;
    if (!fileFree) {
      let exists = false;
      try {
        exists = Deno.statSync(flSrc).isFile;
      } catch {
        //
      }
      if (!exists) {
        await ensureDir(base);
        logger.log("Writing", flSrc, byteSize(data.length));
        await Deno.writeTextFile(flSrc, data);
      }
    } else {
      fileFree[key] = data;
    }
    const flname = isURL ? bi[2] : basename(bi[2]);
    if (!x[flname]) {
      x[flname] = jsname;
      names.push(flname);
      if (customizedDir) {
        dirs[flname] = bi[1].substring(1) || "./";
      }
      // console.log(bi.index, bi[0], bi[1], bi[2]);
    }
  }
  return { x, dirs, names };
}

export const bundlet = async function (
  flpath: string,
  pathPrefix: string,
  distDir?: string,
  mappings?: { [name: string]: string },
): Promise<{ options?: esbuild.BuildOptions; plugins?: esbuild.Plugin[] }> {
  if (!distDir) {
    return {};
  }
  let body = "";
  if (urlpath.test(flpath)) {
    body = await fetch(flpath).then((resp) => resp.text());
    const slashIdx = flpath.indexOf("/", flpath.indexOf("://") + 3);
    const base = slashIdx > -1 ? flpath.substring(0, slashIdx) : flpath;
    body.replace(
      /((?:^|\n)[ \t]*(?:export|import)[^"']+["'])([a-zA-Z][^"':]+)(["']\s*;)/g,
      (s, a, b, c) => {
        if (b.startsWith(".") || /^https?:\/\//.test(b)) {
          return s;
        }
        return `${a}${base}/${b}${c}`;
      },
    );
  } else {
    body = await Deno.readTextFile(flpath);
  }

  const options: esbuild.BuildOptions = { platform: "browser", format: "esm" };
  if (!distDir) distDir = "dist";
  const { x, dirs, names } = await confRules(body, {
    flpath,
    pathPrefix,
    distDir,
    mappings,
  });
  if (!names?.length) {
    return {
      plugins: [],
      options,
    };
  }
  const ignores = (): esbuild.Plugin => ({
    name: "bundlet-keep-imports",
    setup(build: esbuild.PluginBuild) {
      build.onResolve({
        filter: namesFilter(names),
      }, (args: esbuild.OnResolveArgs) => {
        let target = args.path;
        const name = basename(target);
        const key = name.replace(
          /([.](module|es|esm|es6))?[.](tsx?|m?js)$/,
          "",
        );
        const t = mappings?.[name] || fm[key];
        if (t) {
          fm[key] = t;
          return { path: t, external: true };
        }
        const isURL = urlpath.test(target);
        if (isURL && x[isURL ? target : name] === "off") {
          fm[key] = target;
          return { path: target, external: true };
        }
        const src = isURL ? target : name;
        const dir = dirname(target);
        if (!isURL) {
          target = join(args.resolveDir, dirs[src] || dir, x[src] || src);
        }
        if (!urlpath.test(target) && !/^[\/.]/.test(target)) {
          target = `/${target}`;
        }
        fm[key] = target;
        return { path: target, external: true };
      });
    },
  });
  return {
    plugins: [ignores()],
    options,
  };
};
