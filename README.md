# MOODBOARD — Find your visual direction.

An interactive creative-direction generator. You describe the feeling; **Jev** (via the Vercel AI Gateway) classifies your words into exactly one of four predefined visual directions; the interface responds by wearing that direction's full design system.

> **The model chooses. The designer defines the choices. The interface responds to the decision.**

## The four predefined categories

| ID | Name | Description |
|----|------|-------------|
| `minimal` | Minimal | A restrained visual language built around clarity, intentional spacing and quiet confidence. |
| `vibrant` | Vibrant | A high-energy visual language built around expressive colour, bold typography and playful contrast. |
| `futuristic` | Futuristic | A future-facing visual language combining dark surfaces, luminous accents and precise digital details. |
| `organic` | Organic | A grounded visual language inspired by natural materials, soft forms and warm, human-centred design. |

Every palette (5 fixed HEX values each), font pairing, card style and specimen is authored in advance in `directions.js`. Jev never generates colours, categories, fonts or recommendations.

## How classification works

1. The form in `index.html` sends the user's description (max 500 chars) to this app's own `POST /api/decide` endpoint — one request per deliberate submission, never on keystroke.
2. `api/decide.js` (server-side) validates the input and forwards it to the AI Gateway evaluate endpoint with the question below.
3. Jev returns one `choice` plus a `probabilities` map for all four options. The endpoint validates the shape and returns `{ choice, probabilities }` to the browser.
4. `app.js` renders the matching design board and re-themes the page through CSS variables (`styles.css`).

### The exact Jev question and criteria

Model: `typesafe-ai/jev` · Endpoint: `POST https://ai-gateway.vercel.sh/v1/evaluate` · Body: `{ model, state, questions }`, where `state` is the user's description and `questions` is:

```json
{
  "kind": {
    "type": "choice",
    "instructions": "Which predefined creative visual direction best matches the mood and aesthetic described by the user? Choose the closest match based on the description. Do not invent new categories.",
    "criteria": {
      "minimal": "A restrained, clean, understated, elegant or premium visual direction with simplicity and intentional negative space.",
      "vibrant": "An energetic, colourful, expressive, playful, bold or high-contrast visual direction.",
      "futuristic": "A technological, digital, cinematic, futuristic, dark or experimental visual direction.",
      "organic": "A natural, earthy, warm, tactile, botanical, soft or human-centred visual direction."
    }
  }
}
```

## How the interface changes

A successful classification re-themes the whole page (`<html data-theme="…">`) and reveals a direction board with: direction name + description + confidence label, five copyable colour swatches, display/body font specimens, three distinct UI cards (feature, content, action) styled by that direction's system, and a *"How Jev read your input"* probability panel.

## Uncertainty handling (70% threshold)

- Top probability **≥ 0.70** → the theme is applied and the board is labelled **"Clear match"**.
- Top probability **< 0.70** → the page shows *"Your description sits between two creative directions"* with two preview cards (the top-two options, Jev's own pick badged with its probability). The user picks one; the resulting board is labelled **"Your selection"** and explicitly states it is not a new AI result.
- Missing/invalid probabilities → a recoverable error, never an invented result.

## Local development

No build step, no dependencies. Any static server works for the UI:

```bash
# from the repo root
python3 -m http.server 3000
# open http://localhost:3000
```

Note: `/api/decide` is a Vercel serverless function, so live classification locally needs `vercel dev` (or a deployed preview). Without the backend, the form shows a connection error and the Explore/Colour sections still work.

### Backend checks (no key needed)

```bash
node --check api/decide.js
```

## Vercel setup (secure)

1. Push this repo to GitHub and connect it to the **existing** Vercel project (do not create a new one).
2. In the Vercel dashboard go to **Settings → Environment Variables** and add:
   - Name: `AI_GATEWAY_API_KEY`
   - Value: *(the key from your instructor — paste it only in Vercel, never in chat or code)*
   - Environments: Production, Preview, Development
3. Redeploy so the new deployment picks up the variable.
4. The nav pill reads `GET /api/decide`: **READY** means the key is configured server-side.

The key is referenced only as `process.env.AI_GATEWAY_API_KEY` inside `api/decide.js`. It is never exposed to the browser, logged, or returned by any endpoint. Verify with: `git grep -i "api_key\|bearer" -- .` should only show the env-var reference.

## Testing instructions

1. **Confident answer** — submit *"The future after dark — cinematic, technological, neon-lit and precise."* Expect the Futuristic board, a "Clear match" badge and one probability ≥ 70%.
2. **Uncertain answer** — submit something genuinely mixed, e.g. *"Something calm but a little electric, natural yet digital."* If the top probability lands below 70%, expect the two-option chooser and a "Your selection" board after picking.
3. **Deliberately broken input** — submit empty text, whitespace only, or 501+ characters (paste to exceed the counter). Expect HTTP 400 and a helpful inline message; no gateway call is made.

Also covered: repeated submissions replace the board; swatches copy on click with a "Copied" toast; `Enter` submits / `Shift+Enter` new-lines; layout adapts at 960px and 640px breakpoints; `prefers-reduced-motion` disables animation.

## Files

- `index.html` — structure: nav, hero form, result board, library, colour system, about.
- `styles.css` — editorial styling + four themes via CSS variables.
- `directions.js` — the four authored design systems + confidence threshold.
- `app.js` — form handling, `/api/decide` client, rendering, uncertainty flow.
- `api/decide.js` — secure serverless endpoint (validation → gateway → validated `{ choice, probabilities }`).
