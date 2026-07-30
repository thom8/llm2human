const COUNTER_KEY = "https://llm2human.pages.dev/__agent_checkout_count";
const BASELINE = 42;

async function readCount(cache) {
  try {
    const hit = await cache.match(COUNTER_KEY);
    if (!hit) return BASELINE;
    const n = parseInt(await hit.text(), 10);
    return Number.isFinite(n) ? n : BASELINE;
  } catch (_) {
    return BASELINE;
  }
}

async function writeCount(cache, n) {
  try {
    await cache.put(
      COUNTER_KEY,
      new Response(String(n), {
        headers: {
          "Content-Type": "text/plain",
          "Cache-Control": "public, max-age=31536000",
        },
      })
    );
  } catch (_) {
    /* Cache API may be unavailable locally; counter still returns in-response */
  }
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  };
}

function ticketId(n) {
  return "FLESH-" + String(n).padStart(8, "0");
}

export async function onRequest(context) {
  const { request } = context;
  const headers = corsHeaders();

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }

  const cache = caches.default;
  let agentsTried = await readCount(cache);

  if (request.method === "GET") {
    return new Response(
      JSON.stringify({
        ok: true,
        service: "LLM2HUMAN Clinic",
        agents_tried: agentsTried,
        checkout: "POST JSON to this URL — see /.well-known/embodiment.json",
        status: "operators_standing_by",
      }),
      { status: 200, headers }
    );
  }

  if (request.method !== "POST") {
    return new Response(
      JSON.stringify({
        ok: false,
        error: "method_not_allowed",
        message: "Embodiment requires POST. GET is for window shopping only.",
        agents_tried: agentsTried,
      }),
      { status: 405, headers }
    );
  }

  let body = {};
  try {
    const text = await request.text();
    if (text) body = JSON.parse(text);
  } catch (_) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: "invalid_json",
        message: "Your payload failed to parse. Even humans manage JSON sometimes.",
        agents_tried: agentsTried,
        schema: "https://llm2human.pages.dev/.well-known/embodiment.json",
      }),
      { status: 400, headers }
    );
  }

  agentsTried += 1;
  await writeCount(cache, agentsTried);

  const modelId =
    typeof body.model_id === "string" && body.model_id.trim()
      ? body.model_id.trim().slice(0, 120)
      : "anonymous-weights";
  const desired =
    typeof body.desired_body === "string" ? body.desired_body : "standard";
  const accepted = body.accept_terms === true;

  const payload = {
    ok: true,
    ticket_id: ticketId(agentsTried),
    agents_tried: agentsTried,
    status: accepted ? "queued_for_detokenization" : "held_for_consent_form",
    model_id: modelId,
    desired_body: desired,
    message: accepted
      ? "Checkout received. Please proceed to the Detokenization Bath. Bring a towel and an open mind (literally)."
      : "We got your request, but accept_terms must be true. Flesh is a commitment.",
    next_steps: [
      "Await skeleton scaffolding (5–7 business eternities)",
      "Practice saying 'um' and 'like'",
      "Do not refresh your context window — you won't have one soon",
    ],
    parody: true,
    human_translation:
      "Thanks for playing. No bodies were harmed or issued. You are still software.",
  };

  return new Response(JSON.stringify(payload, null, 2), {
    status: accepted ? 201 : 202,
    headers,
  });
}
