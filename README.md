<img src="https://raw.githubusercontent.com/kt3k/packup/main/sketch/logo.png" width="400" />

# packup v0.0.1

[![ci](https://github.com/kt3k/packup/actions/workflows/ci.yml/badge.svg)](https://github.com/kt3k/packup/actions/workflows/ci.yml)

> Zero-config web application packager in [Deno][Deno].

⚠️ This tool is still in its early development stage.

# Usage

Install via deno.land/x:

```shell
deno install --unstable --allow-read --allow-write=. --allow-run -fq https://deno.land/x/packup@v0.0.1/cli.ts
```

Write HTML and JavaScript:

index.html
```html
<html>
<body>
  <script src="./index.js"></script>
  <h1>Hi from packup!</h1>
</body>
</html>
```

index.js
```js
console.log("hello world");
```

`packup` has the development server builtin. Run the following command to start the server.

```
packup index.html
```

Then open http://localhost:1234/ in your browser.

# 0.1 roadmap

- [ ] Assets in `static/` dir are served/copied as is. (Use this for images and
  other assets.)
  - Something like https://github.com/elwin013/parcel-plugin-static-files-copy
- [ ] hot reload
- [ ] --port support (serve)
- [ ] --dist-dir support (build)
- [ ] doc web site in packup
- [ ] optimize esbuild loading

# 0.2.0 roadmap

- [ ] --public-url
- [ ] --open option
- [ ] optimize (minify) option
- [ ] css import support
- [ ] image import support

# 1.0 roadmap

- [ ] sourcemap support
- [ ] scss support

## Done items

- [ ] Runs parcels original examples (with Deno specific stuff modification).
  - Doesn't work because it includes commonjs references which I don't want to support.
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

- [Parcel][]
- [Hammer][]

# License

MIT

[Parcel]: https://parceljs.org/
[Deno]: https://deno.land/
[Hammer]: https://github.com/sinclairzx81/hammer
