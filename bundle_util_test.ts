import { assertEquals, assertStringIncludes } from "./test_deps.ts";
import { bundleByEsbuild, setImportMap, getImportMap } from "./bundle_util.ts";
import { wasmPath } from "./install_util.ts";

Deno.test("bundleByEsbuild - bundles the script by esbuild", async () => {
  const bundle = await bundleByEsbuild("testdata/foo.js", wasmPath());

  assertStringIncludes(bundle, `console.log("hi");`);
});

Deno.test(
  "setImportMap + getImportMap - stores import map for build process",
  () => {
    const importMapFile = "./import_map.json";
    assertEquals(getImportMap(), undefined);
    setImportMap(importMapFile);
    assertEquals(getImportMap(), importMapFile);
  }
);
