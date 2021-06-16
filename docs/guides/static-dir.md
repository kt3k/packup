---
title: Static files
weight: 1
---

# Static files

`packup` provides the special handling of `./static/` directory. `packup` copies / serves the all files under `./static/` directory as is. You can reference these files from your main scripts, markups, or stylesheets.

For example, if you have static directory like the below.

```sh
$ tree static
static
├── foo.png
├── bar.svg
└── styles.css
```

And when you hit the command `packup serve <html>`, these are served as.

```
http://localhost:1234/foo.png
http://localhost:1234/bar.svg
http://localhost:1234/styles.css
```

And when you hit the command `packup build <html>`, these are copied to dist.

```sh
$ tree dist
dist
├── foo.png
├── bar.svg
└── styles.css
```

## Change the static file path

You can configure the static file path by passing `--static-dir` option to the command

```sh
packup serve --static-dir ./public/ index.html
```

```sh
packup build --static-dir ./public/ index.html
```

Above commands use `./public/` directory as static directory.
