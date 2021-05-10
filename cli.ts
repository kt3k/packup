import { parse } from "https://deno.land/std@0.95.0/flags/mod.ts";
import { join } from "https://deno.land/std@0.95.0/path/mod.ts";
import { ensureDir } from "https://deno.land/std@0.95.0/fs/ensure_dir.ts";
import { serve as serveIterable } from "https://deno.land/x/iterable_file_server@v0.1.4/mod.ts";
import { generateAssets, watchAndGenAssets } from "./generate_assets.ts";
import { red } from "https://deno.land/std@0.95.0/fmt/colors.ts";

// TODO(kt3k): Rename to something nice.
const NAME = "deno_parcel";
const VERSION = "v0.0.1";

function usage() {
  console.log(`
Usage: ${NAME} <command> [options]

Options:
  -v, --version               Output the version number
  -h, --help                  Output usage information

Commands:
  serve [options] <input...>  Starts a development server
  build [options] <input...>  Bundles for production
  help <command>              Displays help information for a command

  Run '${NAME} help <command>' for more information on specific commands
`.trim());
}

function usageServe() {
  console.log(`
Usage: parcel serve [options] <input...>

Starts a development server

Options:
  TODO --public-url <url>         the path prefix for absolute urls
  TODO --open [browser]           automatically open in specified browser, defaults to default browser
  TODO --watch-for-stdin          exit when stdin closes
  TODO --lazy                     Build async bundles on demand, when requested in the browser
  TODO --no-hmr                   disable hot module replacement
  TODO -p, --port <port>          set the port to serve on. defaults to $PORT or 1234
  TODO --host <host>              set the host to listen on, defaults to listening on all interfaces
  TODO --https                    serves files over HTTPS
  TODO --cert <path>              path to certificate to use with HTTPS
  TODO --key <path>               path to private key to use with HTTPS
  TODO --hmr-port <port>          hot module replacement port
  TODO --no-cache                 disable the filesystem cache
  TODO --config <path>            specify which config to use. can be a path or a package name
  TODO --cache-dir <path>         set the cache directory. defaults to ".parcel-cache"
  TODO --no-source-maps           disable sourcemaps
  TODO --target [name]            only build given target(s) (default: [])
  TODO --log-level <level>        set the log level (choices: "none", "error", "warn", "info", "verbose")
  TODO --dist-dir <dir>           output directory to write to when unspecified by targets
  TODO --no-autoinstall           disable autoinstall
  TODO --profile                  enable build profiling
  TODO -V, --version              output the version number
  TODO --detailed-report [count]  print the asset timings and sizes in the build report (default: "10")
  TODO --reporter <name>          additional reporters to run (default: [])
  -h, --help                      display help for command`.trim());
}

function usageBuild() {
  console.log(`
Usage: parcel build [options] <input...>

bundles for production

Options:
  TODO --no-optimize              disable minification
  TODO --no-scope-hoist           disable scope-hoisting
  TODO --public-url <url>         the path prefix for absolute urls
  TODO --no-content-hash          disable content hashing
  TODO --no-cache                 disable the filesystem cache
  TODO --config <path>            specify which config to use. can be a path or a package name
  TODO --cache-dir <path>         set the cache directory. defaults to ".parcel-cache"
  TODO --no-source-maps           disable sourcemaps
  TODO --target [name]            only build given target(s) (default: [])
  TODO --log-level <level>        set the log level (choices: "none", "error", "warn", "info", "verbose")
  TODO --dist-dir <dir>           output directory to write to when unspecified by targets
  TODO --no-autoinstall           disable autoinstall
  TODO --profile                  enable build profiling
  TODO -V, --version              output the version number
  TODO --detailed-report [count]  print the asset timings and sizes in the build report (default: "10")
  TODO --reporter <name>          additional reporters to run (default: [])
  -h, --help                      display help for command`.trim());
}

type CliArgs = {
  _: string[];
  version: boolean;
  help: boolean;
  "out-dir"?: string;
  port: number;
};

/**
 * The entrypoint
 */
export async function main(cliArgs: string[] = Deno.args): Promise<number> {
  const {
    _: args,
    version,
    help,
    "out-dir": outDir = "dist",
    port = 1234,
  } = parse(cliArgs, {
    string: ["out-dir"],
    boolean: ["help", "version"],
    alias: {
      h: "help",
      v: "version",
    },
  }) as CliArgs;

  if (help) {
    usage();
    return 0;
  }

  if (version) {
    console.log(NAME, VERSION);
    return 0;
  }

  const command = args[0];

  if (!command) {
    usage();
    return 1;
  }

  if (command === "help") {
    const subcommand = args[1];
    if (!subcommand) {
      usage();
      return 0;
    }
    if (subcommand === "build") {
      usageBuild();
      return 0;
    }
    if (subcommand === "serve") {
      usageServe();
      return 0;
    }
    console.log(`${red("Error")}: Command '${subcommand}' not found`);
    usage();
    return 1;
  }

  if (command === "build") {
    const entrypoint = args[1];
    if (!entrypoint) {
      usageBuild();
      return 1;
    }
    await build(entrypoint, outDir);
    return 0;
  }

  if (command === "serve") {
    const entrypoint = args[1];
    if (!entrypoint) {
      usageServe();
      return 1;
    }
    await serve(entrypoint, { port });
    return 0;
  }

  // Suppose command is implicitly 'serve' and args[0] is the entrypoint
  const entrypoint = args[0];
  if (!entrypoint) {
    usageServe();
    return 1;
  }

  await serve(entrypoint, { port });
  return 0;
}

/**
 * The build command
 */
async function build(path: string, outDir: string) {
  const timeStarted = Date.now();
  console.log(`Writing the assets to ${outDir}`);
  await ensureDir(outDir);
  const [generator] = await generateAssets(path);
  // TODO(kt3k): Use pooledMap-like thing
  for await (const asset of generator) {
    await Deno.writeFile(
      join(outDir, asset.name),
      new Uint8Array(await asset.arrayBuffer()),
    );
  }
  const timeEnded = Date.now();
  console.log(`Built in ${(timeEnded - timeStarted) / 1000}s`);
}

type ServeOptions = {
  port: number;
};

/**
 * The serve command
 */
async function serve(path: string, { port }: ServeOptions) {
  const generator = await watchAndGenAssets(path);
  const { addr } = serveIterable(generator, { port });
  if (addr.transport === "tcp") {
    console.log(`Server running at http://${addr.hostname}:${addr.port}`);
  }
  await new Promise(() => {});
}

if (import.meta.main) {
  Deno.exit(await main());
}
