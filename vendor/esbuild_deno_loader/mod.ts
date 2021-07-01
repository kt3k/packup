import { esbuild, importmap, resolve, toFileUrl } from "./deps.ts";
import { load } from "./src/loader.ts";
import { ModuleEntry } from "./src/deno.ts";

interface DenoPluginOptions {
  /**
   * Specify the path to an import map file to use when resolving import
   * specifiers.
   */
  importMapFile?: string;
}

export function denoPlugin(options: DenoPluginOptions = {}): esbuild.Plugin {
  return {
    name: "deno",
    setup(build) {
      const infoCache = new Map<string, ModuleEntry>();
      let importMap: importmap.ParsedImportMap | null = null;
      build.onStart(async function onStart() {
        if (options.importMapFile !== undefined) {
          const url = toFileUrl(resolve(options.importMapFile));
          const txt = await Deno.readTextFile(url);
          importMap = importmap.parseFromString(txt, url);
        } else {
          importMap = null;
        }
      });
      build.onResolve({ filter: /.*/ }, function onResolve(
        args: esbuild.OnResolveArgs,
      ): esbuild.OnResolveResult | null | undefined {
        const resolveDir = args.resolveDir
          ? `${toFileUrl(args.resolveDir).href}/`
          : "";
        const referrer = args.importer || resolveDir;
        let resolved: URL;
        if (importMap !== null) {
          const res = importmap.resolve(
            args.path,
            importMap,
            new URL(referrer) || undefined,
          );
          resolved = res.resolvedImport;
        } else {
          resolved = new URL(args.path, referrer);
        }
        return { path: resolved.href, namespace: "deno" };
      });
      build.onLoad({ filter: /.*/ }, function onLoad(
        args: esbuild.OnLoadArgs,
      ): Promise<esbuild.OnLoadResult | null> {
        const url = new URL(args.path);
        return load(infoCache, url, options);
      });
    },
  };
}
