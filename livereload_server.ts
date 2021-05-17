import { serve } from "https://deno.land/std@0.96.0/http/server.ts";
import {
  acceptWebSocket,
  isWebSocketCloseEvent,
  isWebSocketPingEvent,
  WebSocket,
} from "https://deno.land/std@0.96.0/ws/mod.ts";

async function handleWs(sock: WebSocket, eventtarget: EventTarget) {
  console.log("socket connected!");
  const handler = async () => {
    console.log("got reload event!");
    if (!sock.isClosed) {
      await sock.send(JSON.stringify({ type: "reload" }));
      sock.close(1000).catch(console.error);
    }
    eventtarget.removeEventListener("reload", handler);
  };
  eventtarget.addEventListener("reload", handler);
  try {
    for await (const ev of sock) {
      if (typeof ev === "string") {
        // text message.
        console.log("ws:Text", ev);
        await sock.send(ev);
      } else if (ev instanceof Uint8Array) {
        // binary message.
        console.log("ws:Binary", ev);
      } else if (isWebSocketPingEvent(ev)) {
        const [, body] = ev;
        // ping.
        console.log("ws:Ping", body);
      } else if (isWebSocketCloseEvent(ev)) {
        // close.
        const { code, reason } = ev;
        console.log("ws:Close", code, reason);
      }
    }
  } catch (err) {
    console.error(`failed to receive frame: ${err}`);

    if (!sock.isClosed) {
      await sock.close(1000).catch(console.error);
    }
  }
}

export async function livereloadServer(port = 35729, eventtarget: EventTarget) {
  console.log(`livereload websocket server is running on port=${port}`);
  for await (const req of serve(`:${port}`)) {
    const { conn, r: bufReader, w: bufWriter, headers } = req;
    acceptWebSocket({
      conn,
      bufReader,
      bufWriter,
      headers,
    })
      .then((ws) => handleWs(ws, eventtarget))
      .catch(async (err) => {
        console.error(`failed to accept websocket: ${err}`);
        await req.respond({ status: 400 });
      });
  }
}
