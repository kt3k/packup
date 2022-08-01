import { assertStringIncludes } from "./test_deps.ts";
import { bundleByEsbuild } from "./bundle_util.ts";

Deno.test("bundleByEsbuild - bundles the script by esbuild", async () => {
  const bundle = await bundleByEsbuild("testdata/foo.js");
  assertStringIncludes(bundle, `console.log("hi");`);
});
