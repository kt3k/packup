import { assertEquals, assertStringIncludes } from "./test_deps.ts";
import { bundleByEsbuild, getImportMap, setImportMap } from "./bundle_util.ts";

Deno.test({
  name: "bundleByEsbuild - bundles the script by esbuild",
  fn: async () => {
    const bundle = await bundleByEsbuild("testdata/foo.js", { minify: false });
    assertStringIncludes(bundle, `console.log("hi");`);
  },
  sanitizeResources: false,
  sanitizeOps: false,
});

Deno.test(
  "setImportMap + getImportMap - stores import map for build process",
  () => {
    const importMapFile = "./import_map.json";
    assertEquals(getImportMap(), undefined);
    setImportMap(importMapFile);
    assertEquals(getImportMap(), importMapFile);
  },
);
