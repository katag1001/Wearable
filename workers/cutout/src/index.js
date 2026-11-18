// workers/cutout/src/index.js
//
// Removes the background from an uploaded photo (Cloudflare Images,
// segment: "foreground"), for our server only
// (server/services/photoService.js) when the phone couldn't do it.
//
//   POST /cutout?key=users/<id>/uploads/<file>
//   header x-cutout-key: <CUTOUT_WORKER_KEY>
//   -> the cut-out as a transparent WebP (200), or { error } (4xx/5xx)
//
// Billed as one ordinary Images transformation (~$0.0005; 5,000 free a
// month). It never saves anything: the server makes and stores the sizes.

const json = (body, status) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method !== "POST" || url.pathname !== "/cutout") {
      return json({ error: "Not found" }, 404);
    }

    if (!env.CUTOUT_WORKER_KEY || request.headers.get("x-cutout-key") !== env.CUTOUT_WORKER_KEY) {
      return json({ error: "Not allowed" }, 401);
    }

    const key = url.searchParams.get("key") || "";

    // Only fresh uploads, never anyone's stored photos.
    if (!/^users\/[a-f0-9]{24}\/uploads\/[0-9a-f-]{36}\.(jpg|png|webp)$/.test(key)) {
      return json({ error: "Bad key" }, 400);
    }

    try {
      const photo = await env.BUCKET.get(key);
      if (!photo) return json({ error: "Upload not found" }, 404);

      const result = await env.IMAGES.input(photo.body)
        .transform({ segment: "foreground" })
        .output({ format: "image/webp" });

      return result.response();
    } catch (error) {
      return json({ error: String(error?.message || error) }, 500);
    }
  },
};
