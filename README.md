<img src="https://raw.githubusercontent.com/kt3k/packup/main/logo/logo.png" width="400" />

# packup v0.0.9

[![ci](https://github.com/kt3k/packup/actions/workflows/ci.yml/badge.svg)](https://github.com/kt3k/packup/actions/workflows/ci.yml)

> Zero-config web application packager in [Deno][Deno].

⚠️ This tool is still in its early development stage.

# Features

- 📦 Bundle web application like [Parcel][Parcel].
- ✨ Support TypeScript out of the box.
- 🦕 Deno-compatible ES Modules resolution.
- 💨 Fast build with [Esbuild][Esbuild]-wasm bundler.

# Usage

Install via deno.land/x:

```shell
deno run -A https://deno.land/x/packup@v0.0.9/install.ts
```

Write HTML and JavaScript:

index.html

```html
<html>
<body>
  <script src="./main.ts"></script>
  <h1>Hi from packup!</h1>
</body>
</html>
```

main.ts

```js
console.log("hello world");
```

`packup` has the development server builtin. Run the following command to start
the server.

```
packup index.html
```

Then open http://localhost:1234/ in your browser.

See `packup serve -h` and `packup build -h` for more usages.

# 0.1 roadmap

- [ ] twind example
- [ ] dom manipulation example
- [ ] give the example way of properly typing the typescripts
  - Maybe use lib: ["dom"] ?

# 0.2.0 roadmap

- [ ] Make esbuild.wasm path configurable
- [ ] --public-url
- [ ] optimize (minify) option
- [ ] css import support
- [ ] image import support
- [ ] doc web site in packup

# 1.0 roadmap

- [ ] import map support
- [ ] sourcemap support
- [ ] scss support

## Done items

- [x] styled-components example
- [x] react router example
- [x] react example
- [x] --open support
- [x] Assets in `static/` dir are served/copied as is. (Use this for images and
  other assets.)
  - Something like https://github.com/elwin013/parcel-plugin-static-files-copy
- [x] livereload
- [x] optimize esbuild loading
- [x] --port support (serve)
- [x] --dist-dir support (build)
- [ ] Runs parcels original examples (with Deno specific stuff modification).
  - Doesn't work because it includes commonjs references which I don't want to
    support.
- [x] List asset sizes
- [x] Bundle javascript using esbuild
- [x] Bundle javascript using swc
- [x] `deno run cli.ts [serve] index.html` starts server at localhost port 1234,
  watch all dependencies, rebuild all assets when changed.
- [x] `deno run cli.ts build index.html` builds static assets to 'dist'
  directory.
- [x] Referenced scripts from `<script>` tags are bundled and served/built.
- [x] Stylesheets referenced from `<link />` tags are just served/copied as is.

## Prior art

- [Parcel][Parcel]
- [Hammer][Hammer]

# License

MIT

[Parcel]: https://parceljs.org/
[Esbuild]: https://esbuild.github.io/
[Deno]: https://deno.land/
[Hammer]: https://github.com/sinclairzx81/hammer
