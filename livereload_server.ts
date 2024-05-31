import { logger } from "./logger_util.ts";

function livereloadScript(port: number) {
  return `window.onload = () => {
  new WebSocket("ws://localhost:${port}/livereload").onmessage = () => location.reload();
};`;
}

function handleWs(sock: WebSocket, eventtarget: EventTarget): void {
  logger.debug("socket connected!");
  sock.onmessage = (ev) => {
    logger.debug("ws:Message", ev.data);
    sock.send(ev.data);
  };
  sock.onopen = () => logger.debug("ws:Open");
  sock.onclose = (ev) => {
    const { code, reason } = ev;
    logger.debug("ws:Close", code, reason);
  };
  sock.onerror = (ev) => {
    logger.error("failed to receive frame:", ev);
    if (canCloseSocket(sock)) {
      sock.close(1000);
    }
  };
  eventtarget.addEventListener("built", () => {
    logger.debug("got reload event!");
    if (canCloseSocket(sock)) {
      sock.send(JSON.stringify({ type: "reload" }));
      sock.close(1000);
    }
  }, { once: true });
}

function canCloseSocket(socket: WebSocket): boolean {
  return socket.readyState === socket.OPEN;
}

function handleHttp(
  request: Request,
  eventtarget: EventTarget,
  port: number,
): Response {
  const url = new URL(request.url);
  switch (url.pathname) {
    case "/livereload.js":
      return new Response(livereloadScript(port), {
        headers: { "content-type": "text/javascript" },
      });
    case "/livereload": {
      if (request.headers.get("upgrade") !== "websocket") {
        return new Response(null, { status: 404 });
      }
      const { response, socket } = Deno.upgradeWebSocket(request);
      handleWs(socket, eventtarget);
      return response;
    }
    default:
      return new Response(null, { status: 404 });
  }
}

interface LivereloadServer {
  close(): Promise<void>;
}

export function livereloadServer(
  port = 35729,
  eventtarget: EventTarget,
): LivereloadServer {
  logger.debug(`livereload websocket server is running on port=${port}`);

  const server = Deno.serve({
    port,
    // suppress unnecessary log
    onListen: () => {},
  }, (request) => handleHttp(request, eventtarget, port));

  return {
    async close() {
      await server.shutdown();
    },
  };
}
