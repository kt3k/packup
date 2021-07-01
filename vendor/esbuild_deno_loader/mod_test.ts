import { denoPlugin } from "./mod.ts";
import { esbuild } from "./test_deps.ts";
import { assert, assertEquals } from "./test_deps.ts";

function test(name: string, fn: () => Promise<void>) {
  Deno.test(name, async () => {
    try {
      await esbuild.initialize({});
      await fn();
    } finally {
      esbuild.stop();
    }
  });
}

test("remote ts", async () => {
  const res = await esbuild.build({
    plugins: [denoPlugin()],
    write: false,
    entryPoints: ["https://deno.land/std@0.95.0/hash/sha1.ts"],
  });
  assertEquals(res.warnings, []);
  assertEquals(res.outputFiles.length, 1);
  const output = res.outputFiles[0];
  assertEquals(output.path, "<stdout>");
  const dataURL = `data:application/javascript;base64,${btoa(output.text)}`;
  const { Sha1 } = await import(dataURL);
  const sha = new Sha1();
  sha.update("foobar");
  const digest = sha.hex();
  assertEquals(digest, "8843d7f92416211de9ebb963ff4ce28125932878");
});

test("local ts", async () => {
  const res = await esbuild.build({
    plugins: [denoPlugin()],
    write: false,
    entryPoints: ["./testdata/mod.ts"],
  });
  assertEquals(res.warnings, []);
  assertEquals(res.outputFiles.length, 1);
  const output = res.outputFiles[0];
  assertEquals(output.path, "<stdout>");
  const dataURL = `data:application/javascript;base64,${btoa(output.text)}`;
  const { bool } = await import(dataURL);
  assertEquals(bool, "asd2");
});

test("local js", async () => {
  const res = await esbuild.build({
    plugins: [denoPlugin()],
    write: false,
    entryPoints: ["./testdata/mod.js"],
  });
  assertEquals(res.warnings, []);
  assertEquals(res.outputFiles.length, 1);
  const output = res.outputFiles[0];
  assertEquals(output.path, "<stdout>");
  const dataURL = `data:application/javascript;base64,${btoa(output.text)}`;
  const { bool } = await import(dataURL);
  assertEquals(bool, "asd");
});

test("local jsx", async () => {
  const res = await esbuild.build({
    plugins: [denoPlugin()],
    write: false,
    entryPoints: ["./testdata/mod.jsx"],
  });
  assertEquals(res.warnings, []);
  assertEquals(res.outputFiles.length, 1);
  const output = res.outputFiles[0];
  assertEquals(output.path, "<stdout>");
  const dataURL = `data:application/javascript;base64,${btoa(output.text)}`;
  const m = await import(dataURL);
  assertEquals(m.default, "foo");
});

test("local tsx", async () => {
  const res = await esbuild.build({
    plugins: [denoPlugin()],
    write: false,
    entryPoints: ["./testdata/mod.tsx"],
  });
  assertEquals(res.warnings, []);
  assertEquals(res.outputFiles.length, 1);
  const output = res.outputFiles[0];
  assertEquals(output.path, "<stdout>");
  const dataURL = `data:application/javascript;base64,${btoa(output.text)}`;
  const m = await import(dataURL);
  assertEquals(m.default, "foo");
});

test("bundle remote imports", async () => {
  const res = await esbuild.build({
    plugins: [denoPlugin()],
    write: false,
    bundle: true,
    platform: "neutral",
    entryPoints: ["https://deno.land/std@0.95.0/uuid/mod.ts"],
  });
  assertEquals(res.warnings, []);
  assertEquals(res.outputFiles.length, 1);
  const output = res.outputFiles[0];
  assertEquals(output.path, "<stdout>");
  const dataURL = `data:application/javascript;base64,${btoa(output.text)}`;
  const { v4 } = await import(dataURL);
  assert(v4.validate(v4.generate()));
});

test("bundle import map", async () => {
  const res = await esbuild.build({
    plugins: [denoPlugin({ importMapFile: "./testdata/importmap.json" })],
    write: false,
    bundle: true,
    platform: "neutral",
    entryPoints: ["./testdata/importmap.js"],
  });
  assertEquals(res.warnings, []);
  assertEquals(res.outputFiles.length, 1);
  const output = res.outputFiles[0];
  assertEquals(output.path, "<stdout>");
  const dataURL = `data:application/javascript;base64,${btoa(output.text)}`;
  const { bool } = await import(dataURL);
  assertEquals(bool, "asd2");
});
