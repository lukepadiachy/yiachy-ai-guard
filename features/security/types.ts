export type Threat = {
  score: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  blocked: boolean;
  tags: string[];
};

export type SecurityResult = {
  allowed: boolean;
  reason: string | null;
  sanitized: string;
  threat: Threat;
};

export type Policy = {
  id: string;
  name: string;
  rules: Rule[];
  blockThreshold: number;
};

export type Rule = {
  id: string;
  type: 'pattern' | 'length' | 'semantic';
  value: string | number;
  action: 'block' | 'warn' | 'log';
};

export type SecurityEvent = {
  id?: string;
  timestamp?: Date;
  inputText: string;
  sanitizedText?: string;
  threatScore?: number;
  severity?: string;
  blocked: boolean;
  policyId: string;
  userId?: string;
};
