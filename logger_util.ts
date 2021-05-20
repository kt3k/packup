import {
  create,
  Level,
} from "https://raw.githubusercontent.com/kt3k/simple_logger/v0.0.3/mod.ts";

export let logger = create("info");

export function setLogLevel(l: Level) {
  logger = create(l);
}
