import { createServer, request } from "node:http";
import { startStandardFixture } from "./standard-fixture";
async function main() {
  const delay=Math.min(15000,Math.max(0,Number(process.env.SIGNATURE_REVIEW_DELAY_MS)||1500));
  const fixture = await startStandardFixture(3116, "signature");
  const proxy = createServer((incoming, outgoing) => {
    const upstream = request(
      fixture.origin + incoming.url,
      {
        method: incoming.method,
        headers: { ...incoming.headers, host: "localhost:3116" },
      },
      (response) => {
        response.pause();
        const release = () => {
          if (outgoing.destroyed) {
            response.destroy();
            return;
          }
          outgoing.writeHead(response.statusCode || 502, response.headers);
          response.pipe(outgoing);
          response.resume();
        };
        // Local acceptance harness only: hold real RSC and image responses; disable proxy image cache.
        const image =
          incoming.url?.startsWith("/_next/image") ||
          incoming.url?.startsWith("/images/") ||
          incoming.url?.startsWith("/reference-story/");
        if (image) response.headers["cache-control"] = "no-store";
        if (incoming.headers.rsc === "1" || image) setTimeout(release, delay);
        else release();
      },
    );
    upstream.on("error", () => {
      if (!outgoing.headersSent) outgoing.writeHead(502);
      outgoing.end("Local review upstream unavailable");
    });
    incoming.pipe(upstream);
  });
  await new Promise<void>((resolve) =>
    proxy.listen(3114, "127.0.0.1", resolve),
  );
  console.log(
    `Slow Signature review: http://localhost:3114 — local PostgreSQL fixture, ${delay}ms RSC/image/font response delay; not Netlify.`,
  );
  process.on("SIGINT", async () => {
    proxy.closeAllConnections();
    proxy.close();
    await fixture.stop();
    process.exit(0);
  });
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
