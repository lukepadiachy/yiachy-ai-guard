export const TYPES = {
  // Configs
  SecurityConfig: Symbol.for('SecurityConfig'),
  AIConfig: Symbol.for('AIConfig'),

  // Services
  SanitizerService: Symbol.for('SanitizerService'),
  DetectorService: Symbol.for('DetectorService'),
  PolicyService: Symbol.for('PolicyService'),
  SecurityOrchestrator: Symbol.for('SecurityOrchestrator'),
  ThreatLogService: Symbol.for('ThreatLogService'),

  // Database
  DatabaseClient: Symbol.for('DatabaseClient'),
};
