import { assertEquals, assertStringIncludes } from "./test_deps.ts";

Deno.test("cli.ts serve <entrypoint> --port <port> --livereload-port <port> -- serves the site at the given port and livereload port", async () => {
  const cmd = new Deno.Command(Deno.execPath(), {
    args: [
      "run",
      "-A",
      "cli.ts",
      "serve",
      "examples/simple/index.html",
      "--port",
      "4567",
      "--livereload-port",
      "34567",
    ],
    stdout: "piped",
    stderr: "inherit",
  });
  const p = cmd.spawn();
  const textDecoder = new TextDecoder();

  const r = p.stdout.getReader();
  const log = textDecoder.decode((await r.read()).value);

  console.log(log);
  assertStringIncludes(log, "Server running");

  let res = await fetch("http://localhost:4567/index.html");

  assertEquals(
    await res.text(),
    `<!DOCTYPE html><html><head></head><body><div>aaa</div>\n<script src="http://localhost:34567/livereload.js"></script></body></html>`,
  );

  // Non existent path returns the same response as the main html.
  // This is useful for apps which use client side routing.
  res = await fetch("http://localhost:4567/asdf");
  assertEquals(
    await res.text(),
    `<!DOCTYPE html><html><head></head><body><div>aaa</div>\n<script src="http://localhost:34567/livereload.js"></script></body></html>`,
  );

  p.kill();
  await r.cancel();
  await p.status;
});
