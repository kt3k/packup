import { compile } from "./sass_util.ts";
import { assertEquals } from "./test_deps.ts";

Deno.test("sass_util - compile", async () => {
  const scss = ".foo { &__bar { margin: 0; } }";
  const css = await compile(scss);

  assertEquals(css, ".foo__bar {\n  margin: 0;\n}");
});
