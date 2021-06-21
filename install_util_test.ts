import { assertEquals } from "./test_deps.ts";
import { join } from "./deps.ts";
import { wasmCacheDir } from "./install_util.ts";

Deno.test("wasmCacheDir - returns cache dir for esbuild wasm", () => {
  const homedir = (os: typeof Deno.build.os) =>
    os === "windows" ? "/userprofile" : "/home/foo";
  assertEquals(
    wasmCacheDir("windows", homedir),
    join("/userprofile", ".deno/packup"),
  );
  assertEquals(
    wasmCacheDir("linux", homedir),
    join("/home/foo", ".deno/packup"),
  );
  assertEquals(
    wasmCacheDir("darwin", homedir),
    join("/home/foo", ".deno/packup"),
  );
});
