import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.9-alpha/deno-dom-wasm.ts";
import { assertEquals } from "https://deno.land/std@0.95.0/testing/asserts.ts";
import { extractReferencedAssets } from "./generate_assets.ts";

Deno.test("extractReferencedAssets - extracts referenced assets in the html document", () => {
  assertEquals([...extractReferencedAssets(
    new DOMParser().parseFromString(
      `
    <html>
      <head>
        <title>Test document</title>
        <link rel="icon" href="/favicon.ico" />
        <link rel="stylesheet" href="css/style.css" />
        <script src="js/script.js"></script>
      </head>
      <body>
        <h1></h1>
      </body>
    </html>
  `,
      "text/html",
    )!,
  )], ["js/script.js", "css/style.css"]);
});
