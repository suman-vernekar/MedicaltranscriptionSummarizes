'use server';

/**
 * @fileOverview Answers questions about a medical summary.
 *
 * - askQuestionAboutSummary - A function that handles the question answering process.
 * - AskQuestionAboutSummaryInput - The input type for the askQuestionAboutSummary function.
 * - AskQuestionAboutSummaryOutput - The return type for the askQuestionAboutSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { getMedicineDetails } from './get-medicine-details';

const AskQuestionAboutSummaryInputSchema = z.object({
    summary: z.string().describe('The medical summary to ask a question about.'),
    question: z.string().describe('The question to ask about the summary.'),
    medicines: z.array(z.string()).describe('A list of medicines mentioned in the summary.'),
});
export type AskQuestionAboutSummaryInput = z.infer<typeof AskQuestionAboutSummaryInputSchema>;

const AskQuestionAboutSummaryOutputSchema = z.object({
  answer: z.string().describe('The answer to the question.'),
});
export type AskQuestionAboutSummaryOutput = z.infer<typeof AskQuestionAboutSummaryOutputSchema>;

export async function askQuestionAboutSummary(
  input: AskQuestionAboutSummaryInput
): Promise<AskQuestionAboutSummaryOutput> {
  return askQuestionAboutSummaryFlow(input);
}

const askQuestionAboutSummaryPrompt = ai.definePrompt({
  name: 'askQuestionAboutSummaryPrompt',
  input: {schema: AskQuestionAboutSummaryInputSchema},
  output: {schema: AskQuestionAboutSummaryOutputSchema},
  tools: [getMedicineDetails],
  prompt: `You are a helpful medical assistant. Your task is to answer the user's question based on the provided medical summary.

  If the question is about a specific medication, you MUST use the getMedicineDetails tool to provide accurate information. Do not answer from your own knowledge.

  Medical Summary:
  ---
  {{{summary}}}
  ---
  Mentioned Medicines: {{{medicines}}}

  Question: {{{question}}}
  `,
});

const askQuestionAboutSummaryFlow = ai.defineFlow(
  {
    name: 'askQuestionAboutSummaryFlow',
    inputSchema: AskQuestionAboutSummaryInputSchema,
    outputSchema: AskQuestionAboutSummaryOutputSchema,
  },
  async input => {
    const {output} = await askQuestionAboutSummaryPrompt(input);
    return output!;
  }
);
