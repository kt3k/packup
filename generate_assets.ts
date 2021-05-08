import {
  Document,
  DOMParser,
  Element,
} from "https://deno.land/x/deno_dom@v0.1.9-alpha/deno-dom-wasm.ts";
import { dirname, join } from "https://deno.land/std@0.95.0/path/mod.ts";
import type { File } from "./types.ts";

const decoder = new TextDecoder();
const encoder = new TextEncoder();

export async function* generateAssets(
  path: string,
): AsyncGenerator<File, void, void> {
  const html = decoder.decode(await Deno.readFile(path));
  const base = dirname(path);

  yield Object.assign(new Blob([encoder.encode(html)]), { name: "index.html" });

  const doc = new DOMParser().parseFromString(html, "text/html")!;

  for (const path of extractReferencedAssets(doc)) {
    console.log("Reading", join(base, path));
    const data = await Deno.readFile(join(base, path));
    yield Object.assign(new Blob([data]), { name: path });
  }
}

export function* extractReferencedAssets(
  doc: Document,
): Generator<string, void, void> {
  yield* extractReferencedScripts(doc);
  yield* extractReferencedStyleSheets(doc);
}

function* extractReferencedScripts(
  doc: Document,
): Generator<string, void, void> {
  for (const s of qs(doc, "script")) {
    const src = s.getAttribute("src");
    if (src) {
      yield src;
    }
  }
}

function* extractReferencedStyleSheets(
  doc: Document,
): Generator<string, void, void> {
  for (const link of qs(doc, "link")) {
    const href = link.getAttribute("href");
    if (link.getAttribute("rel") === "stylesheet" && href) {
      yield href;
    }
  }
}

function* qs(doc: Document, query: string): Generator<Element, void, void> {
  for (const node of doc.querySelectorAll(query)) {
    // deno-lint-ignore no-explicit-any
    yield node as any as Element;
  }
}
