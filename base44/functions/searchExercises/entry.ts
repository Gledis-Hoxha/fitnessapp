import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const BASE_URL = "https://fitgif.vercel.app";
const API_KEY = "fg-AXTQoBBZu907WpP7K0S9AH45";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { search, equipment, bodyPart, target } = await req.json();

    const body = {
      key: API_KEY,
      includeData: true,
      ...(search?.trim() ? { search: search.trim() } : {}),
      ...(equipment ? { equipment } : {}),
      ...(bodyPart ? { bodyPart } : {}),
      ...(target ? { target } : {}),
    };

    const res = await fetch(`${BASE_URL}/api/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      return Response.json({ error: 'Failed to fetch exercises', results: [] }, { status: 502 });
    }

    const data = await res.json();
    return Response.json({ results: data.results || [] });
  } catch (error) {
    return Response.json({ error: error.message, results: [] }, { status: 500 });
  }
});