import { createHash } from "https://deno.land/std@0.95.0/hash/mod.ts";

export function md5(data: string | ArrayBuffer): string {
  const hash = createHash("md5");
  hash.update(data);
  return hash.toString();
}
