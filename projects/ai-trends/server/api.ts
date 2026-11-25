/**
 * Dev-server API for the live demos. Runs inside Vite (npm run dev / preview), so API keys never reach the browser.
 *
 *   GET  /api/status        → which live features have keys configured
 *   POST /api/scribe-token  → single-use ElevenLabs token for realtime transcription in the browser
 *   POST /api/brief         → { transcript } → structured creative brief (Claude, structured output)
 *
 * Every slide that uses these has an offline fallback, so the deck still runs with no keys or no wifi.
 */
import type { Plugin, Connect } from 'vite';
import type { IncomingMessage, ServerResponse } from 'node:http';
import Anthropic from '@anthropic-ai/sdk';
import { betaZodOutputFormat } from '@anthropic-ai/sdk/helpers/beta/zod';
import { z } from 'zod';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

/** Rehearsal panel writes presenter assignments here (served as /presenters.json). */
const PRESENTERS_FILE = fileURLToPath(new URL('../public/presenters.json', import.meta.url));

const BriefSchema = z.object({
  title: z.string().describe('Short working title for the project, 2 to 6 words'),
  objective: z.string().describe('One sentence: what this work must achieve'),
  audience: z.string().describe('Who it is for, in one line'),
  deliverables: z.array(z.string()).describe('Concrete outputs, each a short noun phrase'),
  tone: z.string().describe('Two to four words on voice and feel'),
  timing: z.string().describe('Deadline or timing mentioned, or "Not specified"'),
  open_questions: z.array(z.string()).describe('Things the speaker left unclear that a teammate would ask about'),
});
export type Brief = z.infer<typeof BriefSchema>;

const SYSTEM = `You are a sharp agency producer at Zulu Alpha Kilo. You receive a messy, spoken brief: a transcript with filler words, false starts and tangents.
Turn it into a clear, structured creative brief. Keep the speaker's intent and specifics (names, numbers, dates). Do not invent facts.
Write in plain, confident English: short lines, no jargon, no exclamation marks. If something important is missing, list it under open_questions.`;

function json(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

async function readJson(req: IncomingMessage): Promise<any> {
  const chunks: Buffer[] = [];
  for await (const c of req) chunks.push(c as Buffer);
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'); } catch { return {}; }
}

export function deckApi(env: Record<string, string>): Plugin {
  const anthropic = env.ANTHROPIC_API_KEY ? new Anthropic({ apiKey: env.ANTHROPIC_API_KEY }) : null;

  const handler: Connect.NextHandleFunction = async (req, res, next) => {
    if (!req.url?.startsWith('/api/')) return next();
    try {
      if (req.url === '/api/status') {
        return json(res, 200, { scribe: !!env.ELEVENLABS_API_KEY, claude: !!anthropic });
      }

      if (req.url === '/api/presenters' && req.method === 'POST') {
        const map = await readJson(req);
        if (!map || typeof map !== 'object' || Array.isArray(map)) return json(res, 400, { error: 'expected { slideId: name }' });
        const clean: Record<string, string> = {};
        for (const [k, v] of Object.entries(map)) if (typeof v === 'string' && /^[a-z0-9-]+$/.test(k)) clean[k] = v;
        writeFileSync(PRESENTERS_FILE, JSON.stringify(clean, null, 2) + '\n');
        return json(res, 200, { ok: true, count: Object.keys(clean).length });
      }

      if (req.url === '/api/scribe-token' && req.method === 'POST') {
        if (!env.ELEVENLABS_API_KEY) return json(res, 503, { error: 'ELEVENLABS_API_KEY not set' });
        const r = await fetch('https://api.elevenlabs.io/v1/single-use-token/realtime_scribe', {
          method: 'POST',
          headers: { 'xi-api-key': env.ELEVENLABS_API_KEY },
        });
        if (!r.ok) return json(res, r.status, { error: await r.text() });
        const { token } = await r.json();
        return json(res, 200, { token });
      }

      if (req.url === '/api/brief' && req.method === 'POST') {
        if (!anthropic) return json(res, 503, { error: 'ANTHROPIC_API_KEY not set' });
        const { transcript } = await readJson(req);
        if (!transcript || typeof transcript !== 'string') return json(res, 400, { error: 'transcript required' });

        const response = await anthropic.beta.messages.parse({
          model: 'claude-opus-5-5',
          max_tokens: 4000,
          // Live on stage: keep thinking light so the brief lands in a few seconds.
          output_config: { effort: 'low', format: betaZodOutputFormat(BriefSchema) },
          // If a request is ever declined, the API retries it on a fallback model inside the same call.
          betas: ['server-side-fallback-2026-07-01'],
          fallbacks: 'default',
          system: SYSTEM,
          messages: [{ role: 'user', content: `Spoken brief transcript:\n\n${transcript.slice(0, 20000)}` }],
        });
        if (response.stop_reason === 'refusal' || !response.parsed_output) {
          return json(res, 502, { error: 'No brief returned', stop_reason: response.stop_reason });
        }
        return json(res, 200, { brief: response.parsed_output, model: response.model });
      }

      return json(res, 404, { error: 'Unknown endpoint' });
    } catch (err: any) {
      if (err instanceof Anthropic.AuthenticationError) return json(res, 401, { error: 'Anthropic key rejected' });
      if (err instanceof Anthropic.RateLimitError) return json(res, 429, { error: 'Rate limited' });
      if (err instanceof Anthropic.APIError) return json(res, err.status ?? 500, { error: err.message });
      return json(res, 500, { error: String(err?.message || err) });
    }
  };

  return {
    name: 'zulu-deck-api',
    configureServer(server) { server.middlewares.use(handler); },
    configurePreviewServer(server) { server.middlewares.use(handler); },
  };
}
