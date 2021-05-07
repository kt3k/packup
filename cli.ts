import { parse } from "https://deno.land/std@0.95.0/flags/mod.ts";
import { join } from "https://deno.land/std@0.95.0/path/mod.ts";
import { ensureDir } from "https://deno.land/std@0.95.0/fs/ensure_dir.ts";
import { serve as serveIterable } from "https://deno.land/x/iterable_file_server@v0.1.4/mod.ts";
import { generateAssets } from "./generate_assets.ts";

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
  serve [options] [input...]  Starts a development server
  build [options] [input...]  bundles for production
  help [command]              display help information for a command

  Run '${NAME} help <command>' for more information on specific commands
`.trim());
}

function usageServe() {
  console.log(``);
}

function usageBuild() {
  console.log(``);
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
    if (subcommand === "build") {
      usageBuild();
      return 0;
    }
    if (subcommand === "serve") {
      usageServe();
      return 0;
    }
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
  // TODO(kt3k): Use pooledMap-like thing
  for await (const asset of generateAssets(path)) {
    await Deno.writeFile(
      join(outDir, asset.name),
      new Uint8Array(await asset.arrayBuffer()),
    );
    // console.log(asset, outDir);
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
  const { addr } = serveIterable(generateAssets(path), { port });
  if (addr.transport === "tcp") {
    console.log(`Server running at http://${addr.hostname}:${addr.port}`);
  }
  await new Promise(() => {});
}

if (import.meta.main) {
  Deno.exit(await main());
}
