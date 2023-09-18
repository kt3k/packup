import {
  build,
  CommonOptions,
  denoPlugins,
  denoResolverPlugin,
  exists,
  parseJsonC,
  Plugin,
  resolve,
  stop,
  toFileUrl,
} from "./deps.ts";
import * as npmLocal from "./npm_local.ts";

export async function bundleByEsbuild(
  path: string,
<<<<<<< HEAD
  options?: CommonOptions,
=======
  options?: BuildOptions,
>>>>>>> f9b1714 (fix merge conflicts)
  plugins?: Plugin[],
): Promise<string> {
  const importMapFile = getImportMap();
  let importMapURL: URL | undefined;
  if (importMapFile) {
    importMapURL = toFileUrl(resolve(importMapFile));
  }

  // @NekoMaru76: option tsconfig in esbuild's build doesn't work, so I did this
  let jsx: CommonOptions["jsx"];
  let jsxFactory: CommonOptions["jsxFactory"];
  let jsxFragment: CommonOptions["jsxFragment"];
  let jsxDev: CommonOptions["jsxDev"];
  let jsxImportSource: CommonOptions["jsxImportSource"];

  const tsconfigFile = await getTsconfig();

  if (tsconfigFile) {
    const config = <{
      compilerOptions: {
        experimentalDecorators: true;
        jsx: CommonOptions["jsx"];
        jsxFactory: CommonOptions["jsxFactory"];
        jsxFragmentFactory: CommonOptions["jsxFragment"];
        jsxDev: CommonOptions["jsxDev"];
        jsxImportSource: CommonOptions["jsxImportSource"];
      };
    }> parseJsonC(await Deno.readTextFile(tsconfigFile));

    if (
      config && typeof config === "object" &&
      config.compilerOptions &&
      typeof config.compilerOptions === "object"
    ) {
      jsx = config.compilerOptions.jsx;
      jsxDev = config.compilerOptions.jsxDev;
      jsxFactory = config.compilerOptions.jsxFactory;
      jsxFragment = config.compilerOptions.jsxFragmentFactory;
      jsxImportSource = config.compilerOptions.jsxImportSource;
    }
  }

  if (!plugins) plugins = [];
  plugins.push(npmLocal.resolve);
  plugins.push(denoResolverPlugin({
    importMapURL,
  }));
  plugins = plugins.concat(denoPlugins());
  const entryPoint = /^https?:\/\//.test(path)
    ? path
    : toFileUrl(resolve(path)).href;

  try {
    const bundle = await build({
      entryPoints: [entryPoint],
      plugins,
      minify: true,
      bundle: true,
      write: false,
      jsx,
      jsxFactory,
      jsxDev,
      jsxFragment,
      jsxImportSource,
      format: "esm",
      platform: "browser",
      ...(options || {}),
    });
    return bundle.outputFiles![0].text;
  } catch (err) {
    return err?.toString?.() || "";
  }
}

let _importMap: string | undefined;

export function setImportMap(importMap: string) {
  _importMap = importMap;
}

export function getImportMap() {
  return _importMap;
}

let _tsconfig: string | undefined;

export function setTsconfig(tsconfig: string) {
  _tsconfig = tsconfig;
}

export async function getTsconfig() {
  if (!_tsconfig) {
    if (
      await exists("./deno.json", {
        isReadable: true,
        isDirectory: false,
      })
    ) {
      return "./deno.json";
    }
    if (
      await exists("./deno.jsonc", {
        isReadable: true,
        isDirectory: false,
      })
    ) {
      return "./deno.jsonc";
    }
    if (
      await exists("./tsconfig.json", {
        isReadable: true,
        isDirectory: false,
      })
    ) {
      return "./tsconfig.json";
    }
  }

  return _tsconfig;
}
