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

    const baseBody = {
      key: API_KEY,
      includeData: true,
      ...(equipment ? { equipment } : {}),
      ...(bodyPart ? { bodyPart } : {}),
      ...(target ? { target } : {}),
    };

    // Fetch with retry on transient failures (the upstream API rate-limits)
    const fetchResults = async (searchTerm) => {
      const body = { ...baseBody, ...(searchTerm ? { search: searchTerm } : {}) };
      for (let attempt = 0; attempt < 3; attempt++) {
        const res = await fetch(`${BASE_URL}/api/search`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (res.ok) {
          const data = await res.json();
          return { ok: true, results: data.results || [] };
        }
        // transient (rate limit / 5xx) — wait and retry
        await new Promise((r) => setTimeout(r, 400 * (attempt + 1)));
      }
      return { ok: false, results: [] };
    };

    const term = search?.trim();
    // Candidate terms (max 2): full term, plus a spaced version for compounds (pullup -> "pull up")
    const candidates = [];
    if (term) {
      candidates.push(term);
      let spaced = term.replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase();
      for (const w of ["up", "down", "press", "raise", "row", "curl", "fly", "extension", "ups"]) {
        if (term.toLowerCase().endsWith(w) && term.length > w.length) {
          spaced = `${term.slice(0, -w.length).trim()} ${w}`;
          break;
        }
      }
      if (spaced !== term.toLowerCase()) candidates.push(spaced);
    } else {
      candidates.push("");
    }

    let results = [];
    let anyOk = false;
    for (const c of candidates) {
      const r = await fetchResults(c);
      if (r.ok) anyOk = true;
      if (r.results.length) { results = r.results; break; }
    }

    if (!anyOk && !results.length) {
      return Response.json({ error: 'Service busy, please try again', results: [] }, { status: 502 });
    }

    return Response.json({ results });
  } catch (error) {
    return Response.json({ error: error.message, results: [] }, { status: 500 });
  }
});