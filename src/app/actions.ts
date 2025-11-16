'use server';

import { summarizeMedicalTranscription, SummarizeMedicalTranscriptionInput } from '@/ai/flows/summarize-medical-transcription';
import { askQuestionAboutSummary, AskQuestionAboutSummaryInput } from '@/ai/flows/ask-question-about-summary';

export async function generateSummaryAction(input: SummarizeMedicalTranscriptionInput): Promise<{ summary?: string; medicines?: string[]; error?: string }> {
  if (!input.fileDataUris || input.fileDataUris.length === 0 || !input.fileDataUris.every(uri => uri.startsWith('data:'))) {
    return { error: 'Invalid file data provided.' };
  }
  if (!input.summaryLength) {
    return { error: 'Summary length must be provided.' };
  }

  try {
    const result = await summarizeMedicalTranscription(input);
    return { summary: result.summary, medicines: result.medicines };
  } catch (error) {
    console.error(error);
    return { error: 'Failed to generate summary. The AI model might be unavailable or the document could not be processed.' };
  }
}

export async function askQuestionAction(input: AskQuestionAboutSummaryInput): Promise<{ answer?: string; error?: string }> {
  if (!input.summary || !input.question) {
    return { error: 'Summary and question must be provided.' };
  }
  
  try {
    const result = await askQuestionAboutSummary(input);
    return { answer: result.answer };
  } catch (error) {
    console.error(error);
    return { error: 'Failed to get an answer. The AI model might be unavailable.' };
  }
}
