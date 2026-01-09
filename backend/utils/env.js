import { z } from 'zod';

const envSchema = z.object({
  PORT: z.string().default('3000'),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  RZP_KEY: z.string(),
  RZP_SECRET: z.string(),
  RZP_WEBHOOK_SECRET: z.string(),
  RESEND_MAIL_SECRET: z.string(),
  FRONTEND_URL: z.string().default('http://localhost:3000')
});

/**
 * Validate and load environment variables
 * @throws {Error} If validation fails
 */
const validateEnv = () => {
  try {
    const validated = envSchema.parse(process.env);
    return validated;
  } catch (error) {
    console.error('❌ Environment validation failed:\n');
    
    if (error instanceof z.ZodError) {
      error.issues.forEach((err) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
    } else {
      console.error(`  - ${error.message}`);
    }
    
    console.error('\n💡 Please check your .env file and ensure all required variables are set.\n');
    process.exit(1);
  }
};

export const env = validateEnv();
