import { assertEquals } from "./test_deps.ts";
import { md5 } from "./util.ts";

Deno.test("md5 - returns md5 of the given data", () => {
  assertEquals(md5("a"), "0cc175b9c0f1b6a831c399e269772661");
  assertEquals(md5("b"), "92eb5ffee6ae2fec3ad71c777531578f");
  assertEquals(md5("c"), "4a8a08f09d37b73795649038408b5f33");
});
