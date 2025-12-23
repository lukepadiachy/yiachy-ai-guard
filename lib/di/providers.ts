import { container } from './container';
import { TYPES } from './types';

// Import configs
import { securityConfig } from '@/lib/config/security.config';
import { aiConfig } from '@/lib/config/ai.config';

// Bind configurations
export function setupProviders() {
  container.bind(TYPES.SecurityConfig).toConstantValue(securityConfig);
  container.bind(TYPES.AIConfig).toConstantValue(aiConfig);

  // Services bound when imported (using @injectable)
}
