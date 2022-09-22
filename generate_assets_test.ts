import { DOMParser } from "./deps.ts";
import { assert, assertEquals } from "./test_deps.ts";
import { extractReferencedAssets, generateAssets } from "./generate_assets.ts";

Deno.test("extractReferencedAssets - extracts referenced assets in the html document", () => {
  const assets = [...extractReferencedAssets(
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
            <img
              srcset="images/logo.webp"
              src="images/logo.svg" />
          </body>
        </html>
      `,
      "text/html",
    )!,
  )];
  assertEquals(assets.length, 3);
  assertEquals(assets[0].constructor.name, "ScriptAsset");
  assertEquals(assets[1].constructor.name, "CssAsset");
  assertEquals(assets[2].constructor.name, "ImageAsset");
});

Deno.test("extractReferencedAssets - references to http(s):// schemes are treated as external reference", () => {
  const assets = [...extractReferencedAssets(
    new DOMParser().parseFromString(
      `
        <html>
          <head>
            <title>Test document</title>
            <link rel="stylesheet" href="https://necolas.github.io/normalize.css/8.0.1/normalize.css" />
            <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
          </head>
          <body>
            <h1></h1>
            <img
              srcset="https://deno.land/logo.svg"
              src="https://deno.land/logo.svg" />
          </body>
        </html>
      `,
      "text/html",
    )!,
  )];
  assertEquals(assets.length, 0);
});

Deno.test("generateAssets", async () => {
  const [gen] = await generateAssets("examples/with-imports/index.html", {
    publicUrl: ".",
  });
  const assets = [];
  for await (const asset of gen) {
    assets.push(asset);
  }
  assertEquals(assets.length, 5);

  const [js, css, imgSrc, imgSrcset, html] = assets;
  assert(js.name.endsWith(".js"));
  assert(css.name.endsWith(".css"));
  assert(imgSrc.name.endsWith(".svg"));
  assert(imgSrcset.name.endsWith(".webp"));

  assertEquals(html.name, "index.html");

  const htmlText = await html.text();
  assert(htmlText.includes(`"${js.name}"`));
  assert(htmlText.includes(`"${css.name}"`));
  assert(htmlText.includes(`"${imgSrc.name}"`));
  assert(htmlText.includes(`"${imgSrcset.name} 2x,`));
});
Deno.test("generateAssets - publicUrl=/", async () => {
  const [gen] = await generateAssets("examples/with-imports/index.html", {
    publicUrl: "/",
  });
  const assets = [];
  for await (const asset of gen) {
    assets.push(asset);
  }
  const [js, css, imgSrc, imgSrcset, html] = assets;
  const htmlText = await html.text();
  assert(htmlText.includes(`"/${js.name}"`));
  assert(htmlText.includes(`"/${css.name}"`));
  assert(htmlText.includes(`"/${imgSrc.name}"`));
  assert(htmlText.includes(`"/${imgSrcset.name} 2x,`));
});
