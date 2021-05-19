import { serve } from "https://deno.land/std@0.96.0/http/server.ts";
import {
  acceptWebSocket,
  isWebSocketCloseEvent,
  isWebSocketPingEvent,
  WebSocket,
} from "https://deno.land/std@0.96.0/ws/mod.ts";
import { logger } from "./logger_util.ts";

async function handleWs(sock: WebSocket, eventtarget: EventTarget) {
  logger.debug("socket connected!");
  const handler = async () => {
    logger.debug("got reload event!");
    if (!sock.isClosed) {
      await sock.send(JSON.stringify({ type: "reload" }));
      sock.close(1000).catch(logger.error);
    }
    eventtarget.removeEventListener("built", handler);
  };
  eventtarget.addEventListener("built", handler);
  try {
    for await (const ev of sock) {
      if (typeof ev === "string") {
        // text message.
        logger.debug("ws:Text", ev);
        await sock.send(ev);
      } else if (ev instanceof Uint8Array) {
        // binary message.
        logger.debug("ws:Binary", ev);
      } else if (isWebSocketPingEvent(ev)) {
        const [, body] = ev;
        // ping.
        logger.debug("ws:Ping", body);
      } else if (isWebSocketCloseEvent(ev)) {
        // close.
        const { code, reason } = ev;
        logger.debug("ws:Close", code, reason);
      }
    }
  } catch (err) {
    logger.error(`failed to receive frame: ${err}`);

    if (!sock.isClosed) {
      await sock.close(1000).catch(logger.error);
    }
  }
}

export async function livereloadServer(port = 35729, eventtarget: EventTarget) {
  logger.debug(`livereload websocket server is running on port=${port}`);
  for await (const req of serve(`:${port}`)) {
    if (req.url === "/livereload.js") {
      req.respond({
        body: `
        window.onload = () => {
          new WebSocket("ws://localhost:${port}/livereload").onmessage = () => location.reload();
        };
      `,
      });
      continue;
    }
    const { conn, r: bufReader, w: bufWriter, headers } = req;
    logger.debug(req);
    acceptWebSocket({
      conn,
      bufReader,
      bufWriter,
      headers,
    })
      .then((ws) => handleWs(ws, eventtarget))
      .catch(async (err) => {
        logger.error(`failed to accept websocket: ${err}`);
        await req.respond({ status: 400 });
      });
  }
}
