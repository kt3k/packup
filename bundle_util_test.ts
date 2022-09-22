import { assertEquals, assertStringIncludes } from "./test_deps.ts";
import { bundleByEsbuild, getImportMap, setImportMap } from "./bundle_util.ts";

Deno.test("bundleByEsbuild - bundles the script by esbuild", async () => {
  const bundle = await bundleByEsbuild("testdata/foo.js");

  assertStringIncludes(bundle, `console.log("hi");`);
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
