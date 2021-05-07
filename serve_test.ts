import { assertEquals } from "https://deno.land/std@0.95.0/testing/asserts.ts";
import { join } from "https://deno.land/std@0.95.0/path/mod.ts";
import { main } from "./cli.ts";

Deno.test("cli.ts serve <entrypoint> --port <port> -- serves the site at the given port", async () => {
  const p = Deno.run({
    cmd: [
      "deno",
      "run",
      "-A",
      "--unstable",
      "cli.ts",
      "serve",
      "examples/simple/index.html",
      "--port",
      "4567",
    ],
  });
  await new Promise((resolve) => setTimeout(resolve, 2000));
  const res = await fetch("http://localhost:4567/index.html");
  assertEquals(await res.text(), "<div>aaa</div>\n");
  p.close();
});
