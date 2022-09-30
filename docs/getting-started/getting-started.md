---
title: Getting Started
weight: 0
---

# Getting started

Let's get started with `packup`!

## Install

You need [Deno](https://deno.land/) (>=1.10.3) installed.

You can install `packup` with the following command.

```sh
deno install -qAf https://deno.land/x/packup@v0.2.2/cli.ts
```

Then you'll have `packup` installed.

```sh
$ packup -v
packup v0.2.2
```

## Basic Usage

Let's start making your first web page with packup.

First create an html file. This will be the entrypoint of your site.

```html
<html>
  <body>
    <script src="./main.ts"></script>
    <h1>Hi from packup!</h1>
  </body>
</html>
```

And create `main.ts`.

```ts
const name: string = "packup";
console.log(`hello ${name}`);
```

This is TypeScript. Packup automatically compile this into JavaScript for you!

Then execute the command:

```sh
packup index.html
```

This starts the development server at http://localhost:1234, and you'll see the above html, and compiled javascript loaded into it. This server automatically reloads the page as you modify the contents of the page.

When finished editing of the web site, you hit the command:

```sh
packup build index.html
```

This command bundles the assets and copies the results into `dist/` directory (The output directory can be configured by `--dist-dir` option). The contents of this directory works as a static web site. You can deploy them into any static file hosting service.
