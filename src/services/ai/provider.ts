import { createOpenAI } from '@ai-sdk/openai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { LanguageModel } from 'ai';

export type AIProvider = 'gemini-direct' | 'nararouter';
export type LogicalModel = 'fast' | 'balanced' | 'pro' | 'vision';

interface ProviderConfig {
  name: AIProvider;
  baseURL?: string;
  getApiKey: () => string;
  models: Record<LogicalModel, string>; // Maps logical needs to specific model IDs
}

export function getAIProvider(): AIProvider {
  // PAKSA menggunakan gemini-direct karena bug "Invalid time value" (metadata corrupt) dari NaraRouter
  // return (process.env.AI_PROVIDER as AIProvider) === 'nararouter' ? 'nararouter' : 'gemini-direct';
  return 'gemini-direct';
}

export function getProviderConfig(overrideProvider?: AIProvider): ProviderConfig {
  const provider = overrideProvider || getAIProvider();

  const configs: Record<AIProvider, ProviderConfig> = {
    'gemini-direct': {
      name: 'gemini-direct',
      getApiKey: () => process.env.GOOGLE_GENERATIVE_AI_API_KEY || '',
      models: {
        'fast': 'gemini-3.5-flash-lite',
        'balanced': 'gemini-3.5-flash', // Paling stabil & limit paling besar untuk Free Tier
        'pro': 'gemini-3.1-pro-preview',
        'vision': 'gemini-3.5-flash', // Anti "High Demand" error
      },
    },
    'nararouter': {
      name: 'nararouter',
      baseURL: 'https://router.bynara.id/v1',
      getApiKey: () => process.env.NARA_API_KEY || '',
      models: {
        'fast': 'agnes-3-flash',
        'balanced': 'agnes-3-flash',
        'pro': 'google/gemini-1.5-pro',
        'vision': 'agnes-3-flash',
      },
    },
  };
  return configs[provider];
}

export function getModel(logicalName: LogicalModel): LanguageModel {
  const config = getProviderConfig();
  const modelId = config.models[logicalName];

  if (config.name === 'gemini-direct') {
    const google = createGoogleGenerativeAI({ apiKey: config.getApiKey() });
    return google(modelId);
  }

  const openai = createOpenAI({
    baseURL: config.baseURL,
    apiKey: config.getApiKey()
  });
  return openai(modelId);
}

// Pre-configured models for different use cases
export const aiModels = {
  fast: () => getModel('fast'),
  balanced: () => getModel('balanced'),
  pro: () => getModel('pro'),
  vision: () => getModel('vision'),
  // Helper to retrieve the actual provider name for logging/DB storage
  getProviderName: () => getAIProvider(),
};

export function listAvailableModels(): Record<string, string> {
  return getProviderConfig().models;
}

export function isProviderConfigured(provider?: AIProvider): boolean {
  const config = getProviderConfig(provider);
  return Boolean(config.getApiKey());
}