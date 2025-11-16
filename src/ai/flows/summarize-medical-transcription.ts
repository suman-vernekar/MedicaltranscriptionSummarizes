'use server';

/**
 * @fileOverview Summarizes medical transcriptions from image or PDF files.
 *
 * - summarizeMedicalTranscription - A function that handles the summarization process.
 * - SummarizeMedicalTranscriptionInput - The input type for the summarizeMedicalTranscription function.
 * - SummarizeMedicalTranscriptionOutput - The return type for the summarizeMedicalTranscription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeMedicalTranscriptionInputSchema = z.object({
  fileDataUris: z
    .array(z.string())
    .describe(
      "A medical transcription file (image or PDF), as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  summaryLength: z.enum(['short', 'medium', 'long']).describe('The desired length of the summary.'),
});
export type SummarizeMedicalTranscriptionInput = z.infer<typeof SummarizeMedicalTranscriptionInputSchema>;

const SummarizeMedicalTranscriptionOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the medical transcription.'),
  medicines: z.array(z.string()).describe('A list of any medicine names mentioned in the transcription.'),
});
export type SummarizeMedicalTranscriptionOutput = z.infer<typeof SummarizeMedicalTranscriptionOutputSchema>;

export async function summarizeMedicalTranscription(
  input: SummarizeMedicalTranscriptionInput
): Promise<SummarizeMedicalTranscriptionOutput> {
  return summarizeMedicalTranscriptionFlow(input);
}

const summarizeMedicalTranscriptionPrompt = ai.definePrompt({
  name: 'summarizeMedicalTranscriptionPrompt',
  input: {schema: SummarizeMedicalTranscriptionInputSchema},
  output: {schema: SummarizeMedicalTranscriptionOutputSchema},
  prompt: `You are a medical scribe tasked with summarizing medical transcriptions.

  Your task is to perform two actions:
  1. Provide a concise summary of the key findings and terminologies from the following medical transcription. The summary should be of {{{summaryLength}}} length. The transcription may be split across multiple images.
  2. Identify and extract a list of all medicine names mentioned in the transcription. If no medicines are found, return an empty array.

  {{#each fileDataUris}}
  Transcription Page: {{media url=this}}
  {{/each}}
  `,
});

const summarizeMedicalTranscriptionFlow = ai.defineFlow(
  {
    name: 'summarizeMedicalTranscriptionFlow',
    inputSchema: SummarizeMedicalTranscriptionInputSchema,
    outputSchema: SummarizeMedicalTranscriptionOutputSchema,
  },
  async input => {
    const {output} = await summarizeMedicalTranscriptionPrompt(input);
    return output!;
  }
);
