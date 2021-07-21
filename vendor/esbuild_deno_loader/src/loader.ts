import { esbuild, fromFileUrl } from "../deps.ts";
import { ScriptSet } from "https://deno.land/x/deps_info@v0.2.0/mod.ts"
import {
  isJavaScript,
  isTypeScript,
  isJsx,
  isTsx,
  isCss,
} from "https://deno.land/x/deps_info@v0.2.0/file_type_util.ts";

export interface LoadOptions {
  importMapFile?: string;
}

export async function load(
  scriptSet: ScriptSet,
  url: URL,
  options: LoadOptions,
): Promise<esbuild.OnLoadResult | null> {
  switch (url.protocol) {
    case "http:":
    case "https:":
    case "data:":
      return await loadFromCLI(scriptSet, url, options);
    case "file:": {
      const res = await loadFromCLI(scriptSet, url, options);
      res.watchFiles = [fromFileUrl(url.href)];
      return res;
    }
  }
  return null;
}

async function loadFromCLI(
  scriptSet: ScriptSet,
  specifier: URL,
  _options: LoadOptions,
): Promise<esbuild.OnLoadResult> {
  const specifierRaw = specifier.href;
  if (!scriptSet.has(specifierRaw)) {
    // TODO(kt3k): support import maps
    await scriptSet.loadDeps(specifierRaw);
  }
  const module = scriptSet.get(specifierRaw);
  if (!module) {
    throw new TypeError("Unreachable.");
  }

  if (isJavaScript(module.contentType, module.url)) {
    return { contents: module.source, loader: "js" };
  } else if (isTypeScript(module.contentType, module.url)) {
    return { contents: module.source, loader: "ts" };
  } else if (isJsx(module.contentType, module.url)) {
    return { contents: module.source, loader: "jsx" };
  } else if (isTsx(module.contentType, module.url)) {
    return { contents: module.source, loader: "tsx" };
  } else if (isCss(module.contentType, module.url)) {
    return { contents: module.source, loader: "css" };
  }
  throw new Error(`Unhandled content type ${module.contentType}.`);
}
