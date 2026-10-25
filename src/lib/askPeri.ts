// Ask Peri: rule-based coach by default. If the user has saved a Gemini
// API key in Settings (browser localStorage only), that key is used for a
// live call and any error falls back to the rule-based reply. The key is
// never logged, never stored in code, and only sent to the Gemini endpoint.

import { getGeminiKey } from './store';
import type { Phase } from './cycleEngine';

export function ruleReply(question: string, phase: Phase, cycleDay: number): string {
  const q = question.toLowerCase();
  if (q.includes('cramp')) return 'Cramps today? Gentle warmth, light movement, water, and rest often help. If pain is severe, new, or soaking pads hourly, check in with a clinician promptly.';
  if (q.includes('workout') || q.includes('exercise')) return `Cycle-sync tip for ${phase.label}: ${phase.tip} Today, aim for movement that matches your energy, not against it.`;
  if (q.includes('food') || q.includes('luteal')) return 'For the luteal phase, magnesium-rich foods, complex carbs, and steady protein can steady cravings. In your period, iron-rich foods plus vitamin C help recovery.';
  if (q.includes('doctor')) return 'Open the Health Check tab and use the Doctor visit summary. It pulls your cycle length, next predicted period, flow, and symptoms into one printable card.';
  return `You are on Day ${cycleDay}, ${phase.label}. ${phase.tip} Log today's flow, mood, and symptoms, and Peri's advice will get more personal.`;
}

export async function askPeri(question: string, phase: Phase, cycleDay: number): Promise<{ text: string; source: 'gemini' | 'rule' }> {
  const key = getGeminiKey();
  if (key) {
    try {
      const res = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `You are Peri, a kind cycle wellness companion. Educational only, not medical advice. User is on cycle day ${cycleDay}, ${phase.label}. Question: ${question}` }] }],
          }),
        },
      );
      const json = await res.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
      const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) return { text, source: 'gemini' };
    } catch {
      // fall through to rule-based reply
    }
  }
  return { text: ruleReply(question, phase, cycleDay), source: 'rule' };
}
