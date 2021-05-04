# deno_parcel v0.0.1

> [Parcel][Parcel]-like frontend dev experience in [Deno][Deno].

# 0.1 roadmap

- `deno run cli.ts [serve] index.html` starts server at localhost port 2345,
  watch all dependencies, rebuild all assets when changed.
- `deno run cli.ts build index.html` builds static assets to 'dist' directory.
- Referenced scripts from `<script>` tags are bundled and served/built.
- Stylesheets referenced from `<link />` tags are just served/copied as is.
- Items in `static/` dir are served/copied as is. (Use this for images and other
  assets.)
- supports `--public-url` option for `build` command.

[Parcel]: https://parceljs.org/
[Deno]: https://deno.land/
