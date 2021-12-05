import { assertEquals } from "./test_deps.ts";
import { join } from "./deps.ts";
import { wasmCacheDir } from "./install_util.ts";

const homedir = (os: typeof Deno.build.os) =>
  os === "windows" ? "/userprofile" : "/home/foo";

Deno.test("wasmCacheDir - returns cache dir for esbuild wasm", () => {
  assertEquals(
    wasmCacheDir("windows", homedir, ""),
    join("/userprofile", ".deno/packup"),
  );
  assertEquals(
    wasmCacheDir("linux", homedir, ""),
    join("/home/foo", ".deno/packup"),
  );
  assertEquals(
    wasmCacheDir("darwin", homedir, ""),
    join("/home/foo", ".deno/packup"),
  );
});

Deno.test({
  name: "wasmCacheDir - respects DENO_DIR if defined",
  fn: () => {
    const denoDir = join(Deno.cwd(), ".deno");
    const cacheDir = join(denoDir, "packup");
    assertEquals(wasmCacheDir("windows", homedir, denoDir), cacheDir);
    assertEquals(wasmCacheDir("linux", homedir, denoDir), cacheDir);
    assertEquals(wasmCacheDir("darwin", homedir, denoDir), cacheDir);
  },
  permissions: {
    read: ["."],
  },
});
