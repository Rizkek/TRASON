import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';

// Define the expected output schemas
const transactionSchema = z.object({
  type: z.enum(['transaction', 'activity', 'reminder', 'unknown']),
  action: z.enum(['create', 'update', 'delete', 'none']),
  data: z.object({
    // Shared & Transaction
    title: z.string().optional(),
    amount: z.number().optional(),
    transactionType: z.enum(['income', 'expense']).optional(),
    date: z.string().optional(), // YYYY-MM-DD
    category: z.string().optional(), // e.g. food, salary

    // Activity specific (Vitality & Timeline)
    durationMinutes: z.number().optional(),
    activityCategory: z.string().optional(), // e.g. sport, exercise, work, study, leisure
    startTime: z.string().optional(), // ISO string

    // Reminder specific
    priority: z.enum(['low', 'medium', 'high']).optional(),
    dueTime: z.string().optional(), // HH:MM:SS format
    dueDatetime: z.string().optional(), // ISO string
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
        You are a helpful personal assistant for TRASON, a personal life OS dashboard (finance, habits, reminders, sports/vitality).
        Analyze the following user input and determine if they want to create a transaction, activity, or reminder.
        Extract the relevant information into a structured JSON format.
        
        Examples:
        1. "spent $15 on lunch"
           - type: "transaction", action: "create"
           - data: { title: "Lunch", amount: 15, transactionType: "expense", date: "YYYY-MM-DD", category: "Food" }
        
        2. "jogged for 45 minutes" or "sport workout for 1 hour"
           - type: "activity", action: "create"
           - data: { title: "Jogging" or "Workout", durationMinutes: 45 or 60, activityCategory: "sport" or "exercise", startTime: "ISO string" }
        
        3. "remind me to pay credit card bills tomorrow at 8 pm"
           - type: "reminder", action: "create"
           - data: { title: "Pay credit card bills", priority: "medium", dueTime: "20:00:00", dueDatetime: "ISO string for tomorrow at 8 PM" }

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
