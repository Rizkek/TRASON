import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';

// Define the expected output schemas
const transactionSchema = z.object({
  type: z.enum(['transaction', 'activity', 'reminder', 'unknown']),
  action: z.enum(['create', 'update', 'delete', 'none']),
  data: z.object({
    title: z.string().optional(),
    amount: z.number().optional(),
    transactionType: z.enum(['income', 'expense']).optional(),
    date: z.string().optional(), // ISO string or specific date format
    category: z.string().optional(),
  }).optional(),
  confidence: z.number().min(0).max(1),
  message: z.string(), // A friendly response message to the user
});

export async function parseNaturalLanguageInput(userInput: string) {
  try {
    const { object } = await generateObject({
      model: openai('gpt-4o-mini'),
      schema: transactionSchema,
      prompt: `
        You are a helpful personal assistant for TRASON, a personal finance and habit tracking app.
        Analyze the following user input and determine if they want to create a transaction, activity, or reminder.
        Extract the relevant information into a structured JSON format.
        
        If the user says "spent $15 on lunch", it's a transaction, action create, expense.
        If they say "remind me to pay bills tomorrow", it's a reminder, action create.
        
        Today's date is: ${new Date().toISOString()}
        
        User input: "${userInput}"
      `,
    });

    return object;
  } catch (error) {
    console.error('Error parsing NLP input:', error);
    throw new Error('Failed to parse input.');
  }
}
