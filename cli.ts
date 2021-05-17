import { ensureDir, join, NAME, parseFlags, red, VERSION } from "./deps.ts";
import { serveIterable } from "./unstable_deps.ts";
import { generateAssets, watchAndGenAssets } from "./generate_assets.ts";
import { byteSize } from "./util.ts";

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
  -p, --port <port>               Sets the port to serve on. Default is 1234.
  TODO --static-path <dir path>   The directory for static files. The files here are served as is.
  TODO --public-url <url>         The path prefix for absolute urls.
  TODO --open [browser]           Automatically opens in specified browser. Default is the default browser.
  TODO --https                    Serves files over HTTPS.
  TODO --cert <path>              The path to certificate to use with HTTPS.
  TODO --key <path>               The path to private key to use with HTTPS.
  TODO --log-level <level>        Sets the log level (choices: "none", "error", "warn", "info", "verbose")
  -h, --help                      Displays help for command.
`.trim());
}

function usageBuild() {
  console.log(`
Usage: ${NAME} build [options] <input...>

bundles for production

Options:
  --bundler                       The internal bundler to use. "esbuild" or "swc". Default is "esbuild".
  --dist-dir <dir>                Output directory to write to when unspecified by targets
  TODO --static-path <dir>        The directory for static files. The files here are copied to dist as is.
  TODO --public-url <url>         The path prefix for absolute urls
  TODO -L, --log-level <level>    Set the log level (choices: "none", "error", "warn", "info", "verbose")
  -h, --help                      Display help for command
`.trim());
}

type CliArgs = {
  _: string[];
  version: boolean;
  help: boolean;
  "dist-dir": string;
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
    "dist-dir": distDir = "dist",
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

  if (version) {
    console.log(NAME, VERSION);
    return 0;
  }

  const command = args[0];

  if (help) {
    if (command) {
      switch (command) {
        case "build":
          usageBuild();
          return 0;
        case "serve":
          usageServe();
          return 0;
        default:
          console.error("Error: Command not found:", command);
          usage();
          return 1;
      }
    }
    usage();
    return 0;
  }

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
    await build(entrypoint, { distDir, bundler });
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
  distDir: string;
};

/**
 * The build command
 */
async function build(
  path: string,
  { bundler, distDir }: BuildOptions & BuildAndServeCommonOptions,
) {
  console.log(`Writing the assets to ${distDir}`);
  await ensureDir(distDir);
  const [generator] = await generateAssets(path, { bundler });
  // TODO(kt3k): Use pooledMap-like thing
  for await (const asset of generator) {
    const filename = join(distDir, asset.name);
    const bytes = new Uint8Array(await asset.arrayBuffer());
    console.log("Writing", filename, byteSize(bytes.byteLength));
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
  const { addr } = serveIterable(watchAndGenAssets(path, { bundler, livereloadPort: port }), {
    port,
  });
  if (addr.transport === "tcp") {
    console.log(`Server running at http://${addr.hostname}:${addr.port}`);
  }
  await new Promise(() => {});
}

if (import.meta.main) {
  Deno.exit(await main());
}
