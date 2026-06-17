import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    let body = {};
    try { body = await req.json(); } catch {}

    const search = body.search || "";
    const bodyPart = body.bodyPart || "";
    const equipment = body.equipment || "";
    const target = body.target || "";
    const limit = body.limit || "50";

    const apiKey = Deno.env.get("VITE_WORKOUTX_API_KEY") || "";

    const params = new URLSearchParams({ limit });
    if (search) params.set("search", search);
    if (bodyPart) params.set("bodyPart", bodyPart);
    if (equipment) params.set("equipment", equipment);
    if (target) params.set("target", target);

    const res = await fetch(`https://api.workoutxapp.com/v1/exercises?${params.toString()}`, {
      headers: { "X-WorkoutX-Key": apiKey },
    });

    const data = await res.json();

    if (!res.ok) {
      return Response.json({ error: data.message || "API error" }, { status: res.status });
    }

    return Response.json(data);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});