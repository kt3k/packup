import { assertEquals, assertThrows } from "./test_deps.ts";
import { join } from "./deps.ts";
import {
  byteSize,
  checkUniqueEntrypoints,
  getDependencies,
  getLocalDependencies,
  getLocalDependencyPaths,
  md5,
} from "./util.ts";

const normalize = (p: string) => join(p);

Deno.test("md5 - returns md5 of the given data", () => {
  assertEquals(md5("a"), "0cc175b9c0f1b6a831c399e269772661");
  assertEquals(md5("b"), "92eb5ffee6ae2fec3ad71c777531578f");
  assertEquals(md5("c"), "4a8a08f09d37b73795649038408b5f33");
});

Deno.test("getDependencies - returns dependency specifiers", async () => {
  const cwd = Deno.cwd();
  assertEquals(
    (await getDependencies("testdata/foo.js")).map(normalize),
    [
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
    ].map(normalize),
  );
});

Deno.test("getLocalDependencies - returns local dependency specifiers", async () => {
  const cwd = Deno.cwd();
  assertEquals(
    (await getLocalDependencies("testdata/foo.js")).map(normalize),
    [
      "file://" + join(cwd, "testdata/bar.js"),
      "file://" + join(cwd, "testdata/baz.js"),
      "file://" + join(cwd, "testdata/foo.js"),
    ].map(normalize),
  );
});

Deno.test("getLocalDependencyPaths - returns local dependency paths", async () => {
  const cwd = Deno.cwd();
  assertEquals(
    (await getLocalDependencyPaths("testdata/foo.js")).map(normalize),
    [
      join(cwd, "testdata/bar.js"),
      join(cwd, "testdata/baz.js"),
      join(cwd, "testdata/foo.js"),
    ].map(normalize),
  );
});

Deno.test("byteSize", () => {
  assertEquals(byteSize(345), `345B`);
  assertEquals(byteSize(1700), `1.66KB`);
  assertEquals(byteSize(1300000), `1.24MB`);
});

Deno.test("checkUniqueEntrypoints", () => {
  assertThrows(() => {
    checkUniqueEntrypoints(["index.html", "bar/index.html"]);
  });
  assertThrows(() => {
    checkUniqueEntrypoints(["foo/index.html", "bar/index.html"]);
  });
  checkUniqueEntrypoints(["index.html", "foo.html", "bar.html"]); // doesn't throw
});
