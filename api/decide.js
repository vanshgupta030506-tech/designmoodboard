/* ============================================================
   MOODBOARD — /api/decide serverless endpoint (Vercel).

   The browser calls ONLY this endpoint. The AI Gateway API key
   lives exclusively in the AI_GATEWAY_API_KEY environment
   variable, is used here on the server, and is never exposed
   to the browser, logged, or returned in any response.
   ============================================================ */

"use strict";

var GATEWAY_URL = "https://ai-gateway.vercel.sh/v1/evaluate";
var MODEL = "typesafe-ai/jev";
var MAX_LEN = 500;
var TIMEOUT_MS = 20000;

var CHOICE_IDS = ["minimal", "vibrant", "futuristic", "organic"];

var QUESTION = {
  kind: {
    type: "choice",
    instructions:
      "Which predefined creative visual direction best matches the mood and aesthetic described by the user? Choose the closest match based on the description. Do not invent new categories.",
    criteria: {
      minimal:
        "A restrained, clean, understated, elegant or premium visual direction with simplicity and intentional negative space.",
      vibrant:
        "An energetic, colourful, expressive, playful, bold or high-contrast visual direction.",
      futuristic:
        "A technological, digital, cinematic, futuristic, dark or experimental visual direction.",
      organic:
        "A natural, earthy, warm, tactile, botanical, soft or human-centred visual direction."
    }
  }
};

function send(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}

function isValidProbabilities(p) {
  if (!p || typeof p !== "object" || Array.isArray(p)) return false;
  for (var i = 0; i < CHOICE_IDS.length; i++) {
    var v = p[CHOICE_IDS[i]];
    if (typeof v !== "number" || !Number.isFinite(v) || v < 0 || v > 1) return false;
  }
  return true;
}

/* Defensively extract { choice, probabilities } from the gateway
   payload, whatever wrapper shape it arrives in. Returns null
   when the structure is not as expected — never invents values. */
function extractAnswer(payload) {
  if (!payload || typeof payload !== "object") return null;
  var root = payload.data && typeof payload.data === "object" ? payload.data : payload;
  var answers = root.answers;
  if (!answers || typeof answers !== "object") return null;
  var kind = answers.kind;
  if (!kind || typeof kind !== "object") return null;
  var choice = kind.choice;
  var probabilities = kind.probabilities;
  if (CHOICE_IDS.indexOf(choice) === -1) return null;
  if (!isValidProbabilities(probabilities)) return null;
  return { choice: choice, probabilities: probabilities };
}

async function callGateway(mood, apiKey) {
  var controller = new AbortController();
  var timer = setTimeout(function () { controller.abort(); }, TIMEOUT_MS);
  try {
    var res = await fetch(GATEWAY_URL, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ model: MODEL, state: mood, questions: QUESTION }),
      signal: controller.signal
    });
    var text = await res.text();
    var payload = null;
    try { payload = text ? JSON.parse(text) : null; } catch (e) { payload = null; }
    if (!res.ok) {
      // Never forward upstream details (they may contain sensitive info).
      var err = new Error(
        res.status === 401 || res.status === 403
          ? "The classifier rejected the server credentials."
          : "The classifier is temporarily unavailable. Please try again."
      );
      err.status = res.status === 401 || res.status === 403 ? 500 : 502;
      throw err;
    }
    var answer = extractAnswer(payload);
    if (!answer) {
      var malformed = new Error("The classifier returned an unexpected answer. Please try again.");
      malformed.status = 502;
      throw malformed;
    }
    return answer;
  } catch (err) {
    if (err && err.name === "AbortError") {
      var timeout = new Error("The classifier took too long. Please try again.");
      timeout.status = 504;
      throw timeout;
    }
    if (err && typeof err.status === "number") throw err;
    var net = new Error("Could not reach the classifier. Please try again.");
    net.status = 502;
    throw net;
  } finally {
    clearTimeout(timer);
  }
}

function readJsonBody(req) {
  return new Promise(function (resolve) {
    var chunks = [];
    req.on("data", function (c) { chunks.push(c); });
    req.on("end", function () {
      var raw = Buffer.concat(chunks).toString("utf8");
      if (!raw) return resolve({});
      try { resolve(JSON.parse(raw)); } catch (e) { resolve(null); }
    });
    req.on("error", function () { resolve(null); });
  });
}

module.exports = async function handler(req, res) {
  // Health check for the nav status pill. Reports only whether the
  // server-side key is configured — never the key itself.
  if (req.method === "GET") {
    var configured = Boolean(process.env.AI_GATEWAY_API_KEY);
    return send(res, configured ? 200 : 503, {
      status: configured ? "ready" : "misconfigured",
      configured: configured
    });
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return send(res, 405, { error: "Method not allowed. Use POST." });
  }

  var body = req.body;
  if (body == null || typeof body === "string" || Buffer.isBuffer(body)) {
    body = await readJsonBody(req);
  }
  var mood = body && body.mood;

  if (typeof mood !== "string" || mood.trim().length === 0) {
    return send(res, 400, { error: "Please describe the mood you want first." });
  }
  if (mood.trim().length > MAX_LEN) {
    return send(res, 400, { error: "Please keep your description under 500 characters." });
  }

  var apiKey = process.env.AI_GATEWAY_API_KEY;
  if (!apiKey) {
    return send(res, 500, {
      error: "The classifier is not configured yet. The site owner needs to set AI_GATEWAY_API_KEY in Vercel."
    });
  }

  try {
    var answer = await callGateway(mood.trim(), apiKey);
    return send(res, 200, answer);
  } catch (err) {
    var status = err && typeof err.status === "number" ? err.status : 500;
    return send(res, status, { error: err.message || "Something went wrong. Please try again." });
  }
};
