Deno.serve(async (req) => {
  try {
    let exerciseId;
    if (req.method === "GET") {
      const url = new URL(req.url);
      exerciseId = url.searchParams.get("id");
    } else {
      const body = await req.json().catch(() => ({}));
      exerciseId = body.exerciseId;
    }
    if (!exerciseId) return Response.json({ error: "Missing exerciseId" }, { status: 400 });

    const apiKey = Deno.env.get("VITE_WORKOUTX_API_KEY") || "";

    const res = await fetch(`https://api.workoutxapp.com/v1/gifs/${exerciseId}.gif`, {
      headers: { "X-WorkoutX-Key": apiKey },
    });

    if (!res.ok) {
      return Response.json({ error: "GIF not found" }, { status: res.status });
    }

    const buffer = await res.arrayBuffer();
    const bytes = new Uint8Array(buffer);

    // Chunked base64 encoding to avoid call stack overflow on large GIFs
    const CHUNK = 0x8000; // 32KB chunks
    let base64 = "";
    for (let i = 0; i < bytes.length; i += CHUNK) {
      const chunk = bytes.subarray(i, i + CHUNK);
      base64 += String.fromCharCode.apply(null, chunk);
    }
    base64 = btoa(base64);

    return Response.json({ dataUrl: `data:image/gif;base64,${base64}` });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});