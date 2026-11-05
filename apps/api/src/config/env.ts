import { config } from 'dotenv';
import { resolve } from 'path';

/**
 * .env is optional, and it may sit at the workspace root or beside the app,
 * depending on whether npm started us from apps/api or from the root. Loading
 * is idempotent and never overrides a variable the shell already set.
 */
let loaded = false;

export function loadEnv(): void {
  if (loaded) return;
  loaded = true;
  config();
  config({ path: resolve(process.cwd(), '.env') });
  config({ path: resolve(process.cwd(), '../../.env') });
  // src/config or dist/config → the workspace root, either way.
  config({ path: resolve(__dirname, '../../../../.env') });
}

loadEnv();
