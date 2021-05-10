import { assertEquals } from "./test_deps.ts";
import { join } from "./deps.ts";
import {
  getDependencies,
  getLocalDependencies,
  getLocalDependencyPaths,
  md5,
} from "./util.ts";

Deno.test("md5 - returns md5 of the given data", () => {
  assertEquals(md5("a"), "0cc175b9c0f1b6a831c399e269772661");
  assertEquals(md5("b"), "92eb5ffee6ae2fec3ad71c777531578f");
  assertEquals(md5("c"), "4a8a08f09d37b73795649038408b5f33");
});

Deno.test("getDependencies - returns dependency specifiers", async () => {
  const cwd = Deno.cwd();
  assertEquals(await getDependencies("testdata/foo.js"), [
    "file://" + join(cwd, "testdata/bar.js"),
    "file://" + join(cwd, "testdata/baz.js"),
    "file://" + join(cwd, "testdata/foo.js"),
    "https://deno.land/std@0.95.0/_util/assert.ts",
    "https://deno.land/std@0.95.0/_util/os.ts",
    "https://deno.land/std@0.95.0/path/_constants.ts",
    "https://deno.land/std@0.95.0/path/_interface.ts",
    "https://deno.land/std@0.95.0/path/_util.ts",
    "https://deno.land/std@0.95.0/path/common.ts",
    "https://deno.land/std@0.95.0/path/glob.ts",
    "https://deno.land/std@0.95.0/path/mod.ts",
    "https://deno.land/std@0.95.0/path/posix.ts",
    "https://deno.land/std@0.95.0/path/separator.ts",
    "https://deno.land/std@0.95.0/path/win32.ts",
  ]);
});

Deno.test("getLocalDependencies - returns local dependency specifiers", async () => {
  const cwd = Deno.cwd();
  assertEquals(await getLocalDependencies("testdata/foo.js"), [
    "file://" + join(cwd, "testdata/bar.js"),
    "file://" + join(cwd, "testdata/baz.js"),
    "file://" + join(cwd, "testdata/foo.js"),
  ]);
});

Deno.test("getLocalDependencyPaths - returns local dependency paths", async () => {
  const cwd = Deno.cwd();
  assertEquals(await getLocalDependencyPaths("testdata/foo.js"), [
    join(cwd, "testdata/bar.js"),
    join(cwd, "testdata/baz.js"),
    join(cwd, "testdata/foo.js"),
  ]);
});
