export type MediaType =
  | "JavaScript"
  | "JSX"
  | "TypeScript"
  | "Dts"
  | "TSX"
  | "Json"
  | "Wasm"
  | "TsBuildInfo"
  | "SourceMap"
  | "Unknown";

export interface InfoOutput {
  root: string;
  modules: ModuleEntry[];
}

export interface ModuleEntry {
  specifier: string;
  size: number;
  mediaType?: MediaType;
  local?: string;
  checksum?: string;
  emit?: string;
  map?: string;
  error?: string;
}

interface DenoInfoOptions {
  importMap?: string;
}

export async function info(
  specifier: URL,
  options: DenoInfoOptions,
): Promise<InfoOutput> {
  const cmd = [
    Deno.execPath(),
    "info",
    "--json",
    "--unstable",
  ];
  if (options.importMap !== undefined) {
    cmd.push("--import-map", options.importMap);
  }
  cmd.push(specifier.href);

  let proc;

  try {
    proc = Deno.run({
      cmd,
      stdout: "piped",
    });
    const raw = await proc.output();
    const status = await proc.status();
    if (!status.success) {
      throw new Error(`Failed to call 'deno info' on '${specifier.href}'`);
    }
    const txt = new TextDecoder().decode(raw);
    return JSON.parse(txt);
  } finally {
    try {
      proc?.stdout.close();
    } catch (err) {
      if (err instanceof Deno.errors.BadResource) {
        // ignore the error
      } else {
        // deno-lint-ignore no-unsafe-finally
        throw err;
      }
    }
    proc?.close();
  }
}
