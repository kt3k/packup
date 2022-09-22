import { assertEquals } from "https://deno.land/std@0.155.0/testing/asserts.ts";
import { main } from "./cli.ts";

Deno.test("cli.ts -h, --help -- returns 0", async () => {
  assertEquals(await main(["--help"]), 0);
  assertEquals(await main(["-h"]), 0);
});

Deno.test("cli.ts -v, --version -- returns 0", async () => {
  assertEquals(await main(["--version"]), 0);
  assertEquals(await main(["-v"]), 0);
});

Deno.test("cli.ts help -- returns 0", async () => {
  // This is error because no entrypoint is given
  assertEquals(await main(["help"]), 0);
});

Deno.test("cli.ts help build -- returns 0", async () => {
  // This is error because no entrypoint is given
  assertEquals(await main(["help", "build"]), 0);
});

Deno.test("cli.ts help serve -- returns 0", async () => {
  // This is error because no entrypoint is given
  assertEquals(await main(["help", "serve"]), 0);
});

Deno.test("cli.ts help bar -- returns 1", async () => {
  // This is error because no entrypoint is given
  assertEquals(await main(["help", "bar"]), 1);
});

Deno.test("cli.ts build -- returns 1", async () => {
  // build subcommand with no entrypoint
  assertEquals(await main(["build"]), 1);
});

Deno.test("cli.ts serve -- returns 1", async () => {
  // serve subcommand with no entrypoint
  assertEquals(await main(["serve"]), 1);
});

Deno.test("cli.ts -- returns 1", async () => {
  // This is error because no entrypoint is given
  assertEquals(await main([]), 1);
});
