import { assertEquals } from "./test_deps.ts";
import { wasmCacheDir } from "./install_util.ts";

Deno.test("wasmCacheDir - returns cache dir for esbuild wasm", () => {
  Deno.env.set("USERPROFILE", "/userprofile");
  Deno.env.set("HOME", "/home/foo");
  assertEquals(wasmCacheDir("windows"), "/userprofile/.deno/packup-cache");
  assertEquals(wasmCacheDir("linux"), "/home/foo/.deno/packup-cache");
  assertEquals(wasmCacheDir("darwin"), "/home/foo/.deno/packup-cache");
});
