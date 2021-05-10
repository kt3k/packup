# deno_parcel v0.0.1

> [Parcel][Parcel]-like frontend dev experience in [Deno][Deno].

# 0.1 roadmap

- [ ] Bundle javascript using swc
- [ ] Bundle javascript using esbuild
- [ ] Assets in `static/` dir are served/copied as is. (Use this for images and
  other assets.)
- [ ] supports `--public-url` option for `build` command.
- [ ] Runs parcels original examples (with Deno specific stuff modification).

## Done items

- [x] `deno run cli.ts [serve] index.html` starts server at localhost port 1234,
  watch all dependencies, rebuild all assets when changed.
- [x] `deno run cli.ts build index.html` builds static assets to 'dist'
  directory.
- [x] Referenced scripts from `<script>` tags are bundled and served/built.
- [x] Stylesheets referenced from `<link />` tags are just served/copied as is.

[Parcel]: https://parceljs.org/
[Deno]: https://deno.land/
