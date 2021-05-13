import { encode } from "https://deno.land/std@0.95.0/encoding/base64.ts";
const base64 = encode(await Deno.readFile("esbuild.wasm"));
console.log(`export default "data:application/wasm;base64,${base64}"`);
