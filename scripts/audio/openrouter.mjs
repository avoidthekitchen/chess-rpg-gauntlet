// Shared OpenRouter calls for the audio generators. Needs OPENROUTER_API_KEY_WITH_BUDGET.
import { readFileSync } from 'node:fs';
import { extname } from 'node:path';

const KEY = process.env.OPENROUTER_API_KEY_WITH_BUDGET;
const API = 'https://openrouter.ai/api/v1';

function headers() {
  if (!KEY) throw new Error('Set OPENROUTER_API_KEY_WITH_BUDGET (see ~/.zprofile).');
  return { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' };
}

/** Lyria music: audio output requires streaming; chunks arrive as base64 MP3 in delta.audio. */
export async function generateMusic(model, prompt) {
  const res = await fetch(`${API}/chat/completions`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ model, modalities: ['text', 'audio'], stream: true, audio: { format: 'mp3' }, messages: [{ role: 'user', content: prompt }] }),
  });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  const chunks = [];
  let buffer = '', cost = 0, text = '';
  const decoder = new TextDecoder();
  for await (const part of res.body) {
    buffer += decoder.decode(part, { stream: true });
    let i;
    while ((i = buffer.indexOf('\n')) >= 0) {
      const line = buffer.slice(0, i).trim();
      buffer = buffer.slice(i + 1);
      if (!line.startsWith('data:') || line === 'data: [DONE]') continue;
      let event;
      try { event = JSON.parse(line.slice(5)); } catch { continue; }
      if (event.error) throw new Error(JSON.stringify(event.error));
      if (event.usage?.cost) cost = event.usage.cost;
      const delta = event.choices?.[0]?.delta ?? {};
      if (delta.content) text += delta.content;
      if (delta.audio?.data) chunks.push(Buffer.from(delta.audio.data, 'base64'));
    }
  }
  const audio = Buffer.concat(chunks);
  if (!audio.length) throw new Error(`No audio returned (${text.slice(0, 200)})`);
  return { audio, cost, text };
}

/** Speech and sound effects through /audio/speech. Returns raw bytes (mp3, or 24 kHz mono pcm for Gemini). */
export async function generateSpeech(body) {
  const res = await fetch(`${API}/audio/speech`, { method: 'POST', headers: headers(), body: JSON.stringify(body) });
  const audio = Buffer.from(await res.arrayBuffer());
  if (!res.ok) throw new Error(`${res.status} ${audio.toString().slice(0, 300)}`);
  return { audio, generation: res.headers.get('x-generation-id') };
}

/** Asks an audio-understanding model to listen to clips (sent in order, labelled A, B, C…). */
export async function listen(prompt, files, model = 'google/gemini-4-argon') {
  const content = [{ type: 'text', text: prompt }];
  files.forEach((file, i) => {
    content.push({ type: 'text', text: `Clip ${String.fromCharCode(65 + i)} (${file.split('/').pop()}):` });
    content.push({ type: 'input_audio', input_audio: { data: readFileSync(file).toString('base64'), format: extname(file).slice(1) } });
  });
  const res = await fetch(`${API}/chat/completions`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ model, messages: [{ role: 'user', content }], temperature: 0.2 }),
  });
  const json = await res.json();
  if (!res.ok || json.error) throw new Error(JSON.stringify(json).slice(0, 500));
  return { text: json.choices[0].message.content, cost: json.usage?.cost ?? 0 };
}

/** The key's running spend, to report what a batch cost. */
export async function keyUsage() {
  const res = await fetch(`${API}/key`, { headers: headers() });
  return (await res.json()).data?.usage ?? NaN;
}

/** Speech-to-text, to check that each recorded line says exactly its words. */
export async function transcribe(file, model = 'elevenlabs/scribe-v2') {
  const res = await fetch(`${API}/audio/transcriptions`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ model, language: 'en', input_audio: { data: readFileSync(file).toString('base64'), format: extname(file).slice(1) } }),
  });
  const json = await res.json();
  if (!res.ok || json.error) throw new Error(JSON.stringify(json).slice(0, 300));
  return json.text ?? '';
}
