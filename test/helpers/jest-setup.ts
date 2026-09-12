import * as workerThreads from 'node:worker_threads';

// Polyfill markAsUncloneable for environments running Node < 22.19.0
// Required by undici@8.x (used by testcontainers)
if (typeof (workerThreads as any).markAsUncloneable !== 'function') {
  (workerThreads as any).markAsUncloneable = (obj: unknown) => obj;
}
