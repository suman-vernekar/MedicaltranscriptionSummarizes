'use server';
import { ai } from '@/ai/genkit';
import { z } from 'zod';

const MedicineDetailsSchema = z.object({
    description: z.string().describe("A brief description of the medicine."),
    dosage: z.string().describe("Typical dosage instructions."),
    side_effects: z.string().describe("Common side effects."),
});

export const getMedicineDetails = ai.defineTool(
    {
        name: 'getMedicineDetails',
        description: 'Get details for a specific medicine, such as description, dosage, and side effects.',
        inputSchema: z.object({
            medicineName: z.string().describe("The name of the medicine to look up."),
        }),
        outputSchema: MedicineDetailsSchema,
    },
    async (input) => {
        const { output } = await ai.generate({
            prompt: `Provide a description, typical dosage, and common side effects for the medicine: ${input.medicineName}.`,
            output: {
                format: "json",
                schema: MedicineDetailsSchema,
            },
            model: 'googleai/gemini-2.5-flash',
            config: { temperature: 0.3 }
        });
        return output!;
    }
);
