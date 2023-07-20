import { join, relative, walk } from "./deps.ts";
import { logger } from "./logger_util.ts";

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

type GenerateStaticAssetsOptions = {
  distPrefix: string;
};

export async function* generateStaticAssets(
  dir: string,
  opts: GenerateStaticAssetsOptions,
): AsyncIterable<File> {
  if (!await checkStaticDir(dir)) {
    return;
  }

  for await (const entry of walk(dir)) {
    if (!entry.isDirectory) {
      yield createStaticAssetFromPath(entry.path, dir, opts.distPrefix);
    }
  }
}

export async function* watchAndGenStaticAssets(
  dir: string,
  opts: GenerateStaticAssetsOptions,
): AsyncIterable<File> {
  if (!await checkStaticDir(dir)) {
    return;
  }

  for await (const entry of walk(dir)) {
    if (!entry.isDirectory) {
      yield createStaticAssetFromPath(entry.path, dir, opts.distPrefix);
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
        yield await createStaticAssetFromPath(path, dir, opts.distPrefix);
      } catch (e) {
        logger.error(e);
      }
    }
  }
}

async function createStaticAssetFromPath(
  path: string,
  root: string,
  distPrefix: string,
): Promise<File> {
  logger.debug("Reading", path);
  const bytes = await Deno.readFile(path);
  const webkitRelativePath = relative(root, path);
  return Object.assign(new Blob([bytes]), {
    name: join(distPrefix, webkitRelativePath),
    lastModified: 0,
    webkitRelativePath,
  });
}
