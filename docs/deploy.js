import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { serveDir } from "https://raw.githubusercontent.com/denoland/deno_std/main/http/file_server.ts";

serve((req) => serveDir(req, { fsRoot: "docs", urlRoot: "" }));
