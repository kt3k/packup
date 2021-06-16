---
title: CLI Command
weight: 1
---

# CLI Command

`packup` provides 2 subcommands `packup serve` and `packup build`. This section describe the usage of these commands.

## `packup serve`

The basic usage is like the below.

```
packup serve index.html
```

Here `index.html` is the entrypoint of your website. `packup serve <html>` starts the server and serves all required assets for your page. This command automatically watches the dependency graph of your html, css, javascript, and typescript, and reloads the page when any of the dependency is changed.

The command currently supports the following options.

```
$ packup serve -h
Usage: packup serve [options] <input...>

Starts a development server

Options:
  -p, --port <port>               Sets the port to serve on. Default is 1234.
  --livereload-port               Sets the port for live reloading. Default is 35729.
  -s, --static-dir <dir>          The directory for static files. The files here are served as is.
  -o, --open                      Automatically opens in specified browser.
  --log-level <level>             Sets the log level. "error", "warn", "info", "debug" or "trace". Default is "info".
  -h, --help                      Displays help for command.
```

Because `serve` is the default command of `packup`, you can omit it like the below.

```
packup index.html
```

This is the same as `packup serve index.html`.

## `packup build`

`packup build` builds your assets into static web site. The basic usage is like the below.

```
packup build index.html
```

This builds your web site into `./dist/` directory. The build command currently supports the below options.

```
$ packup build -h
Usage: packup build [options] <input...>

bundles for production

Options:
  --dist-dir <dir>                Output directory to write to when unspecified by targets
  -s, --static-dir <dir>          The directory for static files. The files here are copied to dist as is.
  -L, --log-level <level>         Set the log level (choices: "none", "error", "warn", "info", "verbose")
  -h, --help                      Display help for command
```

