import { serveDir } from "jsr:@std/http@^0.224.2/file-server";

Deno.serve((req) => serveDir(req, { fsRoot: "docs/_site", urlRoot: "" }));
