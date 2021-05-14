import { NAME, VERSION, ensureDir, join, parseFlags, red, serveIterable } from "./deps.ts";
import { generateAssets, watchAndGenAssets } from "./generate_assets.ts";

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
Usage: ${NAME} serve [options] <input...>

Starts a development server

Options:
  --bundler                       The internal bundler to use. "esbuild" or "swc". Default is "esbuild".
  TODO --static <dir path>        The directory for static files. The files here are served as is.
  TODO --public-url <url>         the path prefix for absolute urls
  TODO --open [browser]           automatically open in specified browser, defaults to default browser
  TODO -p, --port <port>          set the port to serve on. defaults to $PORT or 1234
  TODO --https                    serves files over HTTPS
  TODO --cert <path>              path to certificate to use with HTTPS
  TODO --key <path>               path to private key to use with HTTPS
  TODO --log-level <level>        set the log level (choices: "none", "error", "warn", "info", "verbose")
  -h, --help                      display help for command`.trim());
}

function usageBuild() {
  console.log(`
Usage: ${NAME} build [options] <input...>

bundles for production

Options:
  --bundler                       The internal bundler to use. "esbuild" or "swc". Default is "esbuild".
  TODO --static <dir path>        The directory for static files. The files here are copied to dist as is.
  TODO --public-url <url>         the path prefix for absolute urls
  TODO --log-level <level>        set the log level (choices: "none", "error", "warn", "info", "verbose")
  TODO --dist-dir <dir>           output directory to write to when unspecified by targets
  -h, --help                      display help for command`.trim());
}

type CliArgs = {
  _: string[];
  version: boolean;
  help: boolean;
  "out-dir": string;
  port: number;
  bundler: "swc" | "esbuild";
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
    bundler = "esbuild",
  } = parseFlags(cliArgs, {
    string: ["out-dir", "bundler"],
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
    await build(entrypoint, { outDir, bundler });
    return 0;
  }

  if (command === "serve") {
    const entrypoint = args[1];
    if (!entrypoint) {
      usageServe();
      return 1;
    }
    await serve(entrypoint, { port, bundler });
    return 0;
  }

  // Suppose command is implicitly 'serve' and args[0] is the entrypoint
  const entrypoint = args[0];
  if (!entrypoint) {
    usageServe();
    return 1;
  }

  await serve(entrypoint, { port, bundler });
  return 0;
}

type BuildAndServeCommonOptions = {
  bundler: "swc" | "esbuild";
};

type BuildOptions = {
  outDir: string;
};

/**
 * The build command
 */
async function build(
  path: string,
  { bundler, outDir }: BuildOptions & BuildAndServeCommonOptions,
) {
  console.log(`Writing the assets to ${outDir}`);
  await ensureDir(outDir);
  const [generator] = await generateAssets(path, { bundler });
  // TODO(kt3k): Use pooledMap-like thing
  for await (const asset of generator) {
    const filename = join(outDir, asset.name);
    const bytes = new Uint8Array(await asset.arrayBuffer());
    console.log("Writing", filename, `${bytes.byteLength}B`);
    await Deno.writeFile(filename, bytes);
  }
}

type ServeOptions = {
  port: number;
};

/**
 * The serve command
 */
async function serve(
  path: string,
  { port, bundler }: ServeOptions & BuildAndServeCommonOptions,
) {
  const { addr } = serveIterable(watchAndGenAssets(path, { bundler }), { port });
  if (addr.transport === "tcp") {
    console.log(`Server running at http://${addr.hostname}:${addr.port}`);
  }
  await new Promise(() => {});
}

if (import.meta.main) {
  Deno.exit(await main());
}
