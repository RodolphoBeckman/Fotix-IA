'use server';

import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Suporta tanto a chave em inglês (padrão) quanto em português.
const apiKey = process.env.GEMINI_API_KEY || process.env.CHAVE_API_GEMINI;

export const ai = genkit({
  plugins: [googleAI({apiKey})],
  model: 'googleai/gemini-2.5-flash',
});
