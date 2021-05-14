import { assertEquals } from "./test_deps.ts";
import { wasmCacheDir } from "./install_util.ts";

Deno.test("wasmCacheDir - returns cache dir for esbuild wasm", () => {
  const homedir = (os: typeof Deno.build.os) =>
    os === "windows" ? "/userprofile" : "/home/foo";
  assertEquals(wasmCacheDir("windows", homedir), "/userprofile/.deno/packup");
  assertEquals(wasmCacheDir("linux", homedir), "/home/foo/.deno/packup");
  assertEquals(wasmCacheDir("darwin", homedir), "/home/foo/.deno/packup");
});
