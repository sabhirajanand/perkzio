/* eslint-disable no-console */
const path = require('path');
const { spawnSync } = require('child_process');

function loadDotenv() {
  try {
    // We need PORT before invoking `next`.
    // eslint-disable-next-line import/no-extraneous-dependencies, global-require
    const dotenv = require('dotenv');
    dotenv.config({ path: path.join(process.cwd(), '.env.local') });
    dotenv.config({ path: path.join(process.cwd(), '.env') });
  } catch {
    // no-op
  }
}

function main() {
  loadDotenv();

  const args = process.argv.slice(2);
  const cmd = args[0] || 'dev';
  const passThrough = args.slice(1);

  const portFromEnv = process.env.PORT ? Number(process.env.PORT) : NaN;
  const port = Number.isFinite(portFromEnv) ? String(portFromEnv) : '3000';

  const nextBin = process.execPath;
  const nextCli = require.resolve('next/dist/bin/next');
  const nextArgs =
    cmd === 'dev' || cmd === 'start'
      ? [nextCli, cmd, '--port', port, ...passThrough]
      : [nextCli, cmd, ...passThrough];

  const result = spawnSync(nextBin, nextArgs, { stdio: 'inherit', env: process.env });
  process.exit(result.status ?? 1);
}

main();

