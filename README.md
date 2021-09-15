<img src="https://raw.githubusercontent.com/kt3k/packup/main/docs/logo-v2.svg" width="400" />

# packup v0.0.17

[![ci](https://github.com/kt3k/packup/actions/workflows/ci.yml/badge.svg)](https://github.com/kt3k/packup/actions/workflows/ci.yml)

> Zero-config web application packager in [Deno][Deno].

⚠️ This tool is still in its early development stage.

# Features

- 📦 Bundle web application like [Parcel][Parcel].
- ✨ Support TypeScript out of the box.
- 🦕 Deno-compatible ES Modules resolution.
- 💨 Fast build with [esbuild][esbuild]-wasm bundler.

# Usage

Install via deno.land/x:

```shell
deno run -A https://deno.land/x/packup@v0.0.17/install.ts
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

# 0.2.0 roadmap

- [ ] twind example
- [ ] Make esbuild.wasm path configurable
- [ ] --public-url
- [ ] optimize (minify) option
- [ ] css import support
- [ ] image import support

# 1.0 roadmap

- [ ] import map support
- [ ] sourcemap support

## Prior art

- [Parcel][Parcel]
- [Hammer][Hammer]

# History

- 2021-09-08 v0.0.17 Supports multiple entrypoints #14
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
