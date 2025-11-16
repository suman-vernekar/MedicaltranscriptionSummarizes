'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-medical-transcription.ts';
import '@/ai/flows/ask-question-about-summary.ts';
