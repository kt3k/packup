import { assert, assertStringIncludes } from "./test_deps.ts";
import { bundlet } from "./bundlet.ts";
import { bundleByEsbuild } from "./bundle_util.ts";

Deno.test({
  name: "bundlet - bundle off with comment",
  fn: async () => {
    const flpath = "./testdata/bundle-off.js";
    const { options, plugins } = await bundlet(flpath, ".", "./dist");
    const bundle = await bundleByEsbuild(flpath, options, plugins);
    assertStringIncludes(bundle, "https://deqi.deno.dev/lib/x-styles.js");
  },
  sanitizeResources: false,
  sanitizeOps: false,
});

Deno.test({
  name: "bundlet - bundles module with comment",
  fn: async () => {
    const flpath = "./testdata/bundle-module.js";
    const { options, plugins } = await bundlet(flpath, ".", "./dist");
    const bundle = await bundleByEsbuild(flpath, options, plugins);
    assert(/\.\/baz\.\w{32}\.js/.test(bundle));
    assert(/\.\/bar\.\w{32}\.js/.test(bundle));
  },
  sanitizeResources: false,
  sanitizeOps: false,
});
