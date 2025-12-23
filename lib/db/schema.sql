-- Security Events Table
-- Stores all security-related events for audit trail and analysis

CREATE TABLE IF NOT EXISTS security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMP DEFAULT NOW(),

  -- Input data
  input_text TEXT NOT NULL,
  sanitized_text TEXT,

  -- Threat detection results
  threat_score FLOAT,
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  blocked BOOLEAN DEFAULT false,
  tags TEXT[], -- Array of threat tags

  -- Policy and context
  policy_id TEXT NOT NULL,
  user_id TEXT,

  -- AI analysis (optional)
  ai_analysis JSONB,

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_security_events_timestamp ON security_events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_user_id ON security_events(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_security_events_blocked ON security_events(blocked) WHERE blocked = true;
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON security_events(severity);
CREATE INDEX IF NOT EXISTS idx_security_events_policy_id ON security_events(policy_id);

-- Comment on table
COMMENT ON TABLE security_events IS 'Audit log for all security events processed by Yiachy Guard';
COMMENT ON COLUMN security_events.threat_score IS 'Normalized threat score from 0.0 to 1.0';
COMMENT ON COLUMN security_events.tags IS 'Array of detected threat patterns and indicators';
COMMENT ON COLUMN security_events.ai_analysis IS 'JSON data from Guardian Agent deep analysis';
