'use server';

import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

// Suporta tanto a chave em inglês (padrão) quanto em português.
const apiKey = process.env.GEMINI_API_KEY || process.env.CHAVE_API_GEMINI;

export const ai = genkit({
  plugins: [googleAI({apiKey})],
  model: 'googleai/gemini-pro',
});