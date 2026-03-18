import { describe, expect, it } from 'vitest';

describe('package entry', () => {
  it('can be imported in a server-like environment without touching window during module evaluation', async () => {
    const previousWindow = globalThis.window;

    // @ts-expect-error server-like simulation
    delete globalThis.window;

    const mod = await import('../src');

    expect(mod.LivePlayer).toBeTruthy();
    expect(mod.install).toBeTypeOf('function');

    globalThis.window = previousWindow;
  });
});