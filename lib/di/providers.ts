import { container } from './container';
import { TYPES } from './types';

// Import configs
import { securityConfig } from '@/lib/config/security.config';
import { aiConfig } from '@/lib/config/ai.config';

// Import security services
import { SanitizerService } from '@/features/security/services/SanitizerService';
import { DetectorService } from '@/features/security/services/DetectorService';
import { PolicyService } from '@/features/security/services/PolicyService';
import { SecurityOrchestrator } from '@/features/security/services/SecurityOrchestrator';

// Bind configurations and services
export function setupProviders() {
  // Configs
  container.bind(TYPES.SecurityConfig).toConstantValue(securityConfig);
  container.bind(TYPES.AIConfig).toConstantValue(aiConfig);

  // Security Services
  container.bind(TYPES.SanitizerService).to(SanitizerService).inSingletonScope();
  container.bind(TYPES.DetectorService).to(DetectorService).inSingletonScope();
  container.bind(TYPES.PolicyService).to(PolicyService).inSingletonScope();
  container.bind(TYPES.SecurityOrchestrator).to(SecurityOrchestrator).inSingletonScope();
}
