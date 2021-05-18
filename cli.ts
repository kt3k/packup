import { ensureDir, join, NAME, parseFlags, red, VERSION } from "./deps.ts";
import { serveIterable } from "./unstable_deps.ts";
import { generateAssets, watchAndGenAssets } from "./generate_assets.ts";
import { livereloadServer } from "./livereload_server.ts";
import { byteSize } from "./util.ts";
import { logger, setLogLevel } from "./logger_util.ts";

function usage() {
  logger.log(`
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
  logger.log(`
Usage: ${NAME} serve [options] <input...>

Starts a development server

Options:
  -p, --port <port>               Sets the port to serve on. Default is 1234.
  --livereload-port               Sets the port for live reloading. Default is 35729.
  --log-level <level>             Sets the log level. "error", "warn", "info", "debug" or "trace". Default is "info".
  TODO --open [browser]           Automatically opens in specified browser. Default is the default browser.
  TODO --public-url <url>         The path prefix for absolute urls.
  TODO --static-path <dir path>   The directory for static files. The files here are served as is.
  TODO --https                    Serves files over HTTPS.
  TODO --cert <path>              The path to certificate to use with HTTPS.
  TODO --key <path>               The path to private key to use with HTTPS.
  --bundler                       The internal bundler to use. "esbuild" or "swc". Default is "esbuild".
  -h, --help                      Displays help for command.
`.trim());
}

function usageBuild() {
  logger.log(`
Usage: ${NAME} build [options] <input...>

bundles for production

Options:
  --dist-dir <dir>                Output directory to write to when unspecified by targets
  TODO --static-path <dir>        The directory for static files. The files here are copied to dist as is.
  TODO --public-url <url>         The path prefix for absolute urls
  TODO -L, --log-level <level>    Set the log level (choices: "none", "error", "warn", "info", "verbose")
  --bundler                       The internal bundler to use. "esbuild" or "swc". Default is "esbuild".
  -h, --help                      Display help for command
`.trim());
}

type CliArgs = {
  _: string[];
  version: boolean;
  help: boolean;
  "dist-dir": string;
  "log-level": "error" | "warn" | "info" | "debug" | "trace";
  "livereload-port": string;
  port: string;
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
    "log-level": logLevel = "info",
    port = "1234",
    "livereload-port": livereloadPort = 35729,
    bundler = "esbuild",
  } = parseFlags(cliArgs, {
    string: ["out-dir", "log-level", "bundler", "port"],
    boolean: ["help", "version"],
    alias: {
      h: "help",
      v: "version",
    },
  }) as CliArgs;

  setLogLevel(logLevel);

  if (version) {
    logger.log(NAME, VERSION);
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
          logger.error("Error: Command not found:", command);
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
    logger.error(`${red("Error")}: Command '${subcommand}' not found`);
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

  let entrypoint: string;
  if (command === "serve") {
    // packup serve <entrypoint>
    entrypoint = args[1];
  } else {
    // Suppose command is implicitly 'serve' and args[0] is the entrypoint
    // packup <entrypoint>
    entrypoint = args[0];
  }

  if (!entrypoint) {
    usageServe();
    return 1;
  }

  await serve(entrypoint, { port: +port, livereloadPort: +livereloadPort, bundler });
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
  logger.log(`Writing the assets to ${distDir}`);
  await ensureDir(distDir);
  const [generator] = await generateAssets(path, { bundler });
  // TODO(kt3k): Use pooledMap-like thing
  for await (const asset of generator) {
    const filename = join(distDir, asset.name);
    const bytes = new Uint8Array(await asset.arrayBuffer());
    // TODO(kt3k): Print more structured report
    logger.log("Writing", filename, byteSize(bytes.byteLength));
    await Deno.writeFile(filename, bytes);
  }
}

type ServeOptions = {
  port: number;
  livereloadPort: number;
};

/**
 * The serve command
 */
async function serve(
  path: string,
  { port, livereloadPort, bundler }: ServeOptions & BuildAndServeCommonOptions,
) {
  const buildEventHub = new EventTarget();
  livereloadServer(livereloadPort, buildEventHub);
  const { addr } = serveIterable(
    watchAndGenAssets(
      path,
      {
        bundler,
        livereloadPort,
        onBuild: () => {
          logger.debug("onBuild");
          buildEventHub.dispatchEvent(new CustomEvent("reload"));
        },
      },
    ),
    { port },
  );
  if (addr.transport === "tcp") {
    logger.log(`Server running at http://${addr.hostname}:${addr.port}`);
  }
  await new Promise(() => {});
}

if (import.meta.main) {
  Deno.exit(await main());
}
