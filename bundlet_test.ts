import { assert, assertEquals, assertStringIncludes } from "./test_deps.ts";
import { bundlet, confRules, fm } from "./bundlet.ts";
import { bundleByEsbuild } from "./bundle_util.ts";

Deno.test({
  name: "bundlet - bundles module with comment",
  fn: async () => {
    const tempdir = await Deno.makeTempDir();
    const flpath = "./testdata/bundle-examples.js";
    const { options, plugins } = await bundlet(flpath, ".", tempdir);
    const bundle = await bundleByEsbuild(flpath, options, plugins);
    assert(/\/baz\.\w{32}\.js/.test(bundle));
    assert(/\/bar\.\w{32}\.js/.test(bundle));
    assertStringIncludes(bundle, "https://cdn.skypack.dev/three");
    await Deno.remove(tempdir, { recursive: true });
  },
  sanitizeResources: false,
  sanitizeOps: false,
});

Deno.test({
  name: "bundlet - bundles mapping",
  fn: async () => {
    const body = `// !bundle=off
import * as THREE from "https://cdn.skypack.dev/three";
console.log(THREE);
`;
    const tempdir = await Deno.makeTempDir();
    const fileFree = {};
    const result = await confRules(body, {
      flpath: "testing.js",
      pathPrefix: ".",
      distDir: tempdir,
      fileFree,
    });
    assertEquals(fm["three"], "https://cdn.skypack.dev/three");
    console.log(result, fileFree, fm);
    await Deno.remove(tempdir, { recursive: true });
  },
  sanitizeResources: false,
  sanitizeOps: false,
});
