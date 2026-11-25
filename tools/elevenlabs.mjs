#!/usr/bin/env node
// ElevenLabs audio: voiceover, sound effects, music and transcription.
//
//   npm run eleven -- tts   "Line to speak" --out vo/intro.mp3 [--voice <voice_id>] [--model eleven_v3]
//   npm run eleven -- sfx   "soft UI click, glassy, short" --out sfx/click.mp3 [--duration 1.5]
//   npm run eleven -- music "minimal pulsing synth bed, hopeful, 96 bpm" --out music/bed.mp3 [--length 30]
//   npm run eleven -- stt   recording.m4a --out transcript.json [--model scribe_v2]
//   npm run eleven -- clean noisy-vo.wav --out vo-clean.mp3      (Voice Isolator: strip room noise, music, hum)
//   npm run eleven -- voices            (list voices you can use)
//
// Voice defaults to ELEVENLABS_VOICE_ID from .env. Outputs get a <file>.prompt.json sidecar.
import { parseArgs } from 'node:util';
import { readFileSync, writeFileSync } from 'node:fs';
import { basename } from 'node:path';
import { requireEnv, fail, ok, info, userPath, ensureDir, writeSidecar, mimeOf } from './lib/common.mjs';

const API = 'https://api.elevenlabs.io';

const { positionals, values } = parseArgs({
  allowPositionals: true,
  options: {
    out: { type: 'string', short: 'o' },
    voice: { type: 'string', short: 'v' },
    model: { type: 'string', short: 'm' },
    duration: { type: 'string', short: 'd' },
    length: { type: 'string', short: 'l' },
    format: { type: 'string', default: 'mp3_44100_128' },
    help: { type: 'boolean', short: 'h' },
  },
});
const [mode, arg] = positionals;
if (!mode || values.help) {
  console.log(readFileSync(new URL(import.meta.url)).toString().split('\n').filter((l) => l.startsWith('//')).map((l) => l.slice(3)).join('\n'));
  process.exit(0);
}

const key = requireEnv('ELEVENLABS_API_KEY', 'Get one at https://elevenlabs.io/app/settings/api-keys');

async function call(path, init) {
  const res = await fetch(`${API}${path}`, { ...init, headers: { 'xi-api-key': key, ...(init?.headers || {}) } });
  if (!res.ok) fail(`${path} failed (${res.status}): ${await res.text()}`);
  return res;
}
async function saveAudio(res, meta) {
  if (!values.out) fail('--out <file.mp3> is required');
  const out = userPath(values.out);
  ensureDir(out);
  writeFileSync(out, Buffer.from(await res.arrayBuffer()));
  writeSidecar(out, { tool: 'elevenlabs', ...meta });
  ok(out);
}

switch (mode) {
  case 'voices': {
    const res = await call('/v1/voices');
    const { voices } = await res.json();
    for (const v of voices) console.log(`${v.voice_id}  ${v.name}${v.labels ? '  · ' + Object.values(v.labels).join(', ') : ''}`);
    break;
  }
  case 'tts': {
    if (!arg) fail('Usage: eleven tts "text" --out file.mp3');
    const voice = values.voice || process.env.ELEVENLABS_VOICE_ID;
    if (!voice) fail('Pass --voice <id> or set ELEVENLABS_VOICE_ID in .env (npm run eleven -- voices lists them).');
    const model_id = values.model || 'eleven_v3';
    info(`tts → ${voice} (${model_id})`);
    const res = await call(`/v1/text-to-speech/${voice}?output_format=${values.format}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: arg, model_id }),
    });
    await saveAudio(res, { kind: 'tts', voice, model: model_id, text: arg });
    break;
  }
  case 'sfx': {
    if (!arg) fail('Usage: eleven sfx "description" --out file.mp3 [--duration 2]');
    const body = { text: arg };
    if (values.duration) body.duration_seconds = Number(values.duration);
    info('sound effect…');
    const res = await call(`/v1/sound-generation?output_format=${values.format}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    });
    await saveAudio(res, { kind: 'sfx', ...body });
    break;
  }
  case 'music': {
    if (!arg) fail('Usage: eleven music "prompt" --out file.mp3 [--length 30]');
    const body = { prompt: arg, music_length_ms: Math.round(Number(values.length || 30) * 1000) };
    if (values.model) body.model_id = values.model;
    info(`music (${body.music_length_ms / 1000}s)…`);
    const res = await call(`/v1/music?output_format=${values.format}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    });
    await saveAudio(res, { kind: 'music', ...body });
    break;
  }
  case 'stt': {
    if (!arg) fail('Usage: eleven stt <audio-or-video-file> --out transcript.json');
    const file = userPath(arg);
    const form = new FormData();
    form.append('model_id', values.model || 'scribe_v2');
    form.append('file', new Blob([readFileSync(file)], { type: mimeOf(file) }), basename(file));
    info('transcribing…');
    const res = await call('/v1/speech-to-text', { method: 'POST', body: form });
    const json = await res.json();
    if (values.out) {
      const out = userPath(values.out);
      ensureDir(out);
      writeFileSync(out, JSON.stringify(json, null, 2));
      ok(out);
    }
    console.log(json.text ?? JSON.stringify(json, null, 2));
    break;
  }
  case 'clean': {
    if (!arg) fail('Usage: eleven clean <audio-or-video-file> --out clean.mp3');
    const file = userPath(arg);
    const form = new FormData();
    form.append('audio', new Blob([readFileSync(file)], { type: mimeOf(file) }), basename(file));
    info('isolating voice…');
    const res = await call('/v1/audio-isolation', { method: 'POST', body: form });
    await saveAudio(res, { kind: 'clean', source: arg });
    break;
  }
  default:
    fail(`Unknown mode "${mode}". Use tts | sfx | music | stt | clean | voices.`);
}
