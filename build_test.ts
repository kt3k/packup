import { assertEquals } from "./test_deps.ts";
import { join } from "./deps.ts";
import { main } from "./cli.ts";

Deno.test("cli.ts build <entrypoint> --dist-dir <path> -- builds the site into given path", async () => {
  const tempdir = await Deno.makeTempDir();
  const target = "examples/simple/index.html";
  assertEquals(
    await main(["build", target, "--dist-dir", tempdir]),
    0,
  );
  assertEquals(
    await Deno.readTextFile(join(tempdir, target)),
    "<!DOCTYPE html><html><head></head><body><div>aaa</div>\n</body></html>",
  );
  await Deno.remove(tempdir, { recursive: true });
});
