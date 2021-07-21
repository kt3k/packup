import "./custom.d.ts";
import { join } from "https://deno.land/std@0.100.0/path/mod.ts";
import bar from "./bar.css";

console.log(join("foo"));
const a: string = bar;
console.log(a);

console.log(bar);
