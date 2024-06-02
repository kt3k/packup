<img src="https://raw.githubusercontent.com/kt3k/packup/main/docs/logo-v2.svg" width="400" />

# packup v0.2.6

[![ci](https://github.com/kt3k/packup/actions/workflows/ci.yml/badge.svg)](https://github.com/kt3k/packup/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/kt3k/packup/branch/main/graph/badge.svg?token=OjZni3m4yk)](https://codecov.io/gh/kt3k/packup)

> Zero-config web application packager for [Deno][Deno].

# Features

- 📦 Bundle web application like [Parcel][Parcel].
- ✨ Support TypeScript out of the box.
- 🦕 Deno-compatible ES Modules resolution.
- 💨 Fast build with [esbuild][esbuild] bundler.

# Usage

Install via deno.land/x:

```shell
deno install -qAf https://deno.land/x/packup@v0.2.6/cli.ts
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

# Typings

You can type check the script with [Deno][Deno].

You need the following `tsconfig.json` for your frontend scripts correctly type
checked.

```json
{
  "compilerOptions": {
    "lib": ["esnext", "dom"]
  }
}
```

If you use vscode you need to set 'deno.config' property in
`.vscode/settings.json` file to point the tsconfig.json:

```json
{
  "deno.enable": true,
  "deno.lint": true,
  "deno.unstable": true,
  "deno.config": "./tsconfig.json"
}
```

If you'd prefer to use CLI directly to type check your script, you can use the
following command for it:

```sh
deno cache --config tsconfig.json <script>
```

See [the example repository](https://github.com/kt3k/packup_example) for more
details.

# 1.0 roadmap

- [x] --public-url
- [x] image import support
- [x] import map support
- [ ] twind example
- [ ] optimize (minify) option
- [ ] css import support
- [ ] scss `@import` support
- [ ] sourcemap support

## Prior art

- [Parcel][Parcel]
- [Hammer][Hammer]

# History

- 2022-09-22 v0.2.1 Fix path issues on windows. #50
- 2022-09-22 v0.2.0 Update esbuild. #49
- 2022-09-11 v0.1.14 Add import map support. #47
- 2022-07-12 v0.1.13 Add `<DOCTYPE html>` to html by default. #44 tag. #39
- 2021-12-27 v0.1.11 Add support of `<img>` `srcset` attribute and `<source>`
  tag. #39
- 2021-12-22 v0.1.11 Add support of image imports (in html). #33
- 2021-12-05 v0.1.10 Install wasm under `DENO_DIR` when it's specified. #31
- 2021-12-05 v0.1.9 Add logging related to sass.
- 2021-11-29 v0.1.8 Add `--static-dist-prefix` option #30
- 2021-11-29 v0.1.7 Add `--public-url` option #29
- 2021-10-21 v0.1.6 CLI start up time improvement
- 2021-10-20 v0.1.5 Remove the use of unstable flag #28
- 2021-10-19 v0.1.4 Change esbuild wasm file name.
- 2021-09-19 v0.1.3 Skip processing http(s):// url references in html #22.
- 2021-09-17 v0.1.2 Fix -p option.
- 2021-09-16 v0.1.1 Add `ensure_esbuild_wasm.ts` entrypoint.
- 2021-09-15 v0.1.0 Add basic support of scss #18
- 2021-09-08 v0.0.17 Support multiple entrypoints #14
- 2021-09-01 v0.0.16 Fix the message when the server starts #11
- 2021-07-31 v0.0.15 Update `iterable_file_server`
- 2021-07-01 v0.0.14 Fix @import-maps/resolve dependency
  https://github.com/kt3k/packup/commit/4c502652315d5d15755be340318263dbd75fb12f
  . Remove --bundler options
  https://github.com/kt3k/packup/commit/e66c76695e0415c9aeb97e8c1b477a828daf5c52
- 2021-06-21 v0.0.13 Fix for windows https://github.com/kt3k/packup/pull/5.

# License

MIT

[Parcel]: https://parceljs.org/
[Esbuild]: https://esbuild.github.io/
[Deno]: https://deno.land/
[Hammer]: https://github.com/sinclairzx81/hammer
