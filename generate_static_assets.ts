import { relative, walk } from "./deps.ts";
import { logger } from "./logger_util.ts";

type File = Blob & { name: string };

export async function checkStaticDir(dir: string): Promise<boolean> {
  try {
    const stat = await Deno.lstat(dir);
    if (stat.isDirectory) {
      logger.info(`Using "${dir}" as static directory`);
      return true;
    } else {
      logger.warn(`Error: "${dir}" is not directory`);
      return false;
    }
  } catch (e) {
    if (e.name === "NotFound") {
      logger.info(`No static dir "${dir}"`);
      return false;
    }
    logger.error(e);
    return false;
  }
}

export async function* generateStaticAssets(dir: string): AsyncIterable<File> {
  if (!await checkStaticDir(dir)) {
    return;
  }

  for await (const entry of walk(dir)) {
    if (!entry.isDirectory) {
      yield createStaticAssetFromPath(entry.path, dir);
    }
  }
}

export async function* watchAndGenStaticAssets(
  dir: string,
): AsyncIterable<File> {
  if (!await checkStaticDir(dir)) {
    return;
  }

  for await (const entry of walk(dir)) {
    if (!entry.isDirectory) {
      yield createStaticAssetFromPath(entry.path, dir);
    }
  }

  for await (const e of Deno.watchFs(dir)) {
    for (const path of e.paths) {
      // TODO(kt3k): Make this concurrent
      try {
        const stat = await Deno.lstat(path);
        if (stat.isDirectory) {
          continue;
        }
        yield await createStaticAssetFromPath(path, dir);
      } catch (e) {
        logger.error(e);
      }
    }
  }
}

async function createStaticAssetFromPath(
  path: string,
  root: string,
): Promise<File> {
  logger.debug("Reading", path);
  const bytes = await Deno.readFile(path);
  return Object.assign(new Blob([bytes]), { name: relative(root, path) });
}
