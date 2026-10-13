import 'server-only';
import path from 'node:path';

/** Server configuration only; never infer this exception from a request Host. */
export function rejectHostedDemo(env: NodeJS.ProcessEnv = process.env) {
  if ((env.NETLIFY && env.NETLIFY !== 'false') || (env.CONTEXT && env.CONTEXT !== 'local') ||
      env.DEPLOY_ID || env.DEPLOY_URL || env.NETLIFY_BLOBS_CONTEXT || env.NETLIFY_DATABASE_URL ||
      env.AWS_LAMBDA_FUNCTION_NAME || env.FUNCTIONS_WORKER_RUNTIME || env.VERCEL || env.VERCEL_ENV ||
      env.BLOB_READ_WRITE_TOKEN) {
    throw new Error('Local demo is forbidden in a deployed environment.');
  }
}
export function localDemoConfig(env: NodeJS.ProcessEnv = process.env) {
  if (!env.LOCAL_DEMO || env.LOCAL_DEMO === '0') {
    if (env.MEDIA_PROVIDER === 'filesystem') throw new Error('Filesystem media requires the local demo runner.');
    return null;
  }
  rejectHostedDemo(env);
  if (env.LOCAL_DEMO !== '1' || env.LOCAL_DEMO_RUNNER !== 'loopback-v1' ||
      env.CONTEXT !== 'local' || env.CONTENT_ENV !== 'local-demo' ||
      !/^local-demo-(standard|signature)$/.test(env.SITE_ID || '') || env.MEDIA_PROVIDER !== 'filesystem') {
    throw new Error('Incomplete local demo configuration; use npm run demo:local.');
  }
  const origin = new URL(env.AUTH_URL || 'invalid:');
  const database = new URL(env.DATABASE_URL || 'invalid:');
  if (origin.protocol !== 'http:' || !['localhost', '127.0.0.1'].includes(origin.hostname) ||
      !['localhost', '127.0.0.1'].includes(database.hostname) || database.protocol !== 'postgresql:') {
    throw new Error('Local demo requires loopback HTTP and PostgreSQL.');
  }
  const root = path.resolve(env.LOCAL_DEMO_DATA_DIR || '');
  const allowed = path.resolve('local-data');
  const relative = path.relative(allowed, root);
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error('Local demo data must use an isolated directory beneath project local-data.');
  }
  return { root };
}
