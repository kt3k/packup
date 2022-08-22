import { dirname, join } from "./deps.ts";
import * as path from "https://deno.land/std/path/mod.ts";
import * as esbuild from "https://deno.land/x/esbuild@v0.14.50/mod.js";

let rootDir = "./node_modules";
let server: Deno.Listener;
let port = 12345;

async function modulesServe(port = 0, root?: string) {
  server = Deno.listen({ hostname: "localhost", port: port || 12345 });
  if (root) {
    rootDir = root;
  }
  for await (const conn of server) {
    serveHttp(conn);
  }
}

export const modules = {
  serve: (host = "") => {
    if (host === "-") return;
    const i = host.indexOf(":");
    let root = "";
    if (i > -1) {
      port = parseInt(host.substring(i + 1), 10);
      root = host.substring(0, i);
    } else {
      root = host;
    }
    modulesServe(port, root);
  },
  close: () => {
    server?.close();
  },
};

function found(flpath: string, base: string): string {
  let info;
  try {
    flpath = join(base, flpath);
    try {
      info = Deno.statSync(flpath);
    } catch {
      // skip
    }
    if (!info?.isFile && !info?.isDirectory && !info?.isSymlink) {
      const exts = ["ts", "js", "mjs"];
      for (let i = 0; i < exts.length; i++) {
        try {
          info = Deno.statSync(`${flpath}.${exts[i]}`);
          if (info.isFile || info.isSymlink) {
            flpath = `${flpath}.${exts[i]}`;
            break;
          }
          if (info.isDirectory) {
            continue;
          }
        } catch {
          // skip
        }
      }
    }
    if (!info?.isFile) {
      return "";
    }
    return flpath;
  } catch {
    //
  }
  return "";
}

const ext = /\.(m?js|ts)$/i;
const xfrom = /((?:import|from)\s+['"])([^'"]+)(['"])/g;

async function serveHttp(conn: Deno.Conn) {
  const httpConn = Deno.serveHttp(conn);
  for await (const requestEvent of httpConn) {
    const url = new URL(requestEvent.request.url);
    const flpath = found(
      decodeURIComponent(url.pathname.substring(1)),
      rootDir,
    );
    if (!flpath) {
      await requestEvent.respondWith(
        new Response("404 Not Found", { status: 404 }),
      );
      return;
    }
    const body = await Deno.readTextFile(flpath);

    await requestEvent.respondWith(
      new Response(body.replace(xfrom, (s, m1, m2, m3) => {
        if (ext.test(m2)) {
          return s;
        }
        const m = found(m2, path.dirname(flpath)).match(ext);
        if (m) {
          return [m1, `${m2}${m[0]}`, m3].join("");
        }
        return s;
      })),
    );
  }
}

export const npmLocal = ({
  name: "npm-local-modules",
  setup(build: any) {
    build.onResolve({ filter: /^npm:/ }, (args: any) => {
      if (!server) {
        return { path: args.path };
      }
      const path = `http://localhost:${port}/${args.path.substring(4)}`;
      return {
        path,
        namespace: "http-url",
      };
    });
  },
} as esbuild.Plugin);
