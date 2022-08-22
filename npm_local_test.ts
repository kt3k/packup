import { assert, assertStringIncludes } from "./test_deps.ts";
import { bundleByEsbuild } from "./bundle_util.ts";
import * as npmLocal from "./npm_local.ts";

Deno.test({
  name: "npmLocal - serve local npm modules and load with npm: prefix",
  fn: async () => {
    npmLocal.serve("./testdata:12345");
    const flpath = "./testdata/npm.js";
    const bundle = await bundleByEsbuild(flpath, {
      minify: false,
      platform: "browser",
      format: "esm",
    });
    assertStringIncludes(bundle, `console.log("hi");`);
  },
  sanitizeResources: false,
  sanitizeOps: false,
});
