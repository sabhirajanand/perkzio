import type { Express } from 'express';

export function registerV1Routes(app: Express): void {
  app.get('/v1', (_req, res) => {
    res.json({ name: 'perkzio-api', version: '0.1.0' });
  });
}
