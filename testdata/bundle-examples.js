// !bundle=module
import { baz } from "./baz.js";

// !bundle=/bar
import { bar } from "./bar.js";

baz();
bar();

// !bundle=off
import * as THREE from "https://cdn.skypack.dev/three";
console.log(THREE);
