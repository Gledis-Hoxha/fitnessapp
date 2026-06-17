import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const url = new URL(req.url);
    const exerciseId = url.searchParams.get("id");
    if (!exerciseId) return Response.json({ error: "Missing id" }, { status: 400 });

    const apiKey = Deno.env.get("VITE_WORKOUTX_API_KEY") || "";

    const res = await fetch(`https://api.workoutxapp.com/v1/gifs/${exerciseId}.gif`, {
      headers: { "X-WorkoutX-Key": apiKey },
    });

    if (!res.ok) {
      return Response.json({ error: "GIF not found" }, { status: res.status });
    }

    const buffer = await res.arrayBuffer();
    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": "image/gif",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});