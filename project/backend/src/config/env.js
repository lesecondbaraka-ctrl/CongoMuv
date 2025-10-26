// Centralized environment configuration with sane defaults for development.
// WARNING: Contains secrets for local development at user's request. Do not commit to public repos.

const env = {
  PORT: process.env.PORT || '3002',
  NODE_ENV: process.env.NODE_ENV || 'development',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',

  SUPABASE_URL: process.env.SUPABASE_URL || 'https://bnyoyldctqbppvwqfodc.supabase.co',
  SUPABASE_SERVICE_ROLE_KEY:
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJueW95bGRjdHFicHB2d3Fmb2RjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDYzMTcxOSwiZXhwIjoyMDc2MjA3NzE5fQ.uLoD2YjcjVtV0sTvrTqrWTrRLl7mr6Pe3jfkAiAakGs',

  EMAIL_HOST: process.env.EMAIL_HOST || 'smtp.gmail.com',
  EMAIL_PORT: process.env.EMAIL_PORT || '587',
  EMAIL_USER: process.env.EMAIL_USER || 'bahatilegrand@gmail.com',
  EMAIL_PASS: process.env.EMAIL_PASS || 'fneg wiok rygu kurr',

  JWT_SECRET:
    process.env.JWT_SECRET ||
    '7f64bc5c7ec6f1bd3470803c8b3f8fe12d00982b6c90e648dd01f6d3a8eee61edc285a433f0cf5abb3ffd8ee04624cb6a9b36ab08add02503b5e358ce6d58bf8',
};

module.exports = env;
