export const securityConfig = {
  threatThreshold: 0.7,
  blockEnabled: true,

  policies: {
    default: {
      maxPromptLength: 10000,
      blockedPatterns: [
        'ignore previous',
        'system prompt',
        'disregard instructions',
      ],
    },
  },

  openguardrails: {
    apiUrl: process.env.OPENGUARDRAILS_URL || 'http://localhost:8080',
    apiKey: process.env.OPENGUARDRAILS_API_KEY,
  },
} as const;

export type SecurityConfig = typeof securityConfig;
