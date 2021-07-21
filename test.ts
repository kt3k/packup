import { wasmPath } from "./install_util.ts";
import { bundleByEsbuild } from "./bundle_util.ts";

const res = await bundleByEsbuild("foo.ts", wasmPath());

for (const i of res!) {
  console.log(i.text);
}
