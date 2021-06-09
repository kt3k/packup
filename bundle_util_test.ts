import { assertStringIncludes } from "./test_deps.ts";
import { bundleByEsbuild, bundleBySwc } from "./bundle_util.ts";
import { wasmPath } from "./install_util.ts";

Deno.test("bundleByEsbuild - bundles the script by esbuild", async () => {
  const bundle = await bundleByEsbuild("testdata/foo.js", wasmPath());

  assertStringIncludes(bundle, `console.log("hi");`);
});

Deno.test("bundleBySwc - bundles the script by swc", async () => {
  const bundle = await bundleBySwc("testdata/foo.js");

  assertStringIncludes(bundle, `console.log("hi");`);
});
