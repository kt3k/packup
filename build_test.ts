import { assertEquals } from "https://deno.land/std@0.95.0/testing/asserts.ts";
import { join } from "https://deno.land/std@0.95.0/path/mod.ts";
import { main } from "./cli.ts";

Deno.test("cli.ts build <entrypoint> --out-dir <path> -- builds the site into given path", async () => {
  const tempdir = await Deno.makeTempDir();
  assertEquals(
    await main(["build", "examples/simple/index.html", "--out-dir", tempdir]),
    0,
  );
  assertEquals(
    await Deno.readTextFile(join(tempdir, "index.html")),
    "<div>aaa</div>\n",
  );
});
