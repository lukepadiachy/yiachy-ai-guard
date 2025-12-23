export const aiConfig = {
  models: {
    guardian: 'gemini-2.0-flash-exp',
    analyzer: 'gemini-2.0-flash-exp',
  },

  limits: {
    maxTokens: 8192,
    temperature: 0.3,
  },

  providers: {
    google: {
      apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    },
    openai: {
      apiKey: process.env.OPENAI_API_KEY,
    },
    anthropic: {
      apiKey: process.env.ANTHROPIC_API_KEY,
    },
  },
} as const;

export type AIConfig = typeof aiConfig;
