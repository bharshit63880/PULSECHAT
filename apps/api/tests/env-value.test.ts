import { describe, expect, it } from 'vitest';

import { normalizeEnvironmentString } from '../src/config/env-value';

describe('environment value normalization', () => {
  it.each([
    ['CLOUDINARY_CLOUD_NAME', 'demo-cloud'],
    ['CLOUDINARY_API_KEY', 'demo-key'],
    ['CLOUDINARY_API_SECRET', 'demo-secret'],
  ])('normalizes a copied %s env-file assignment', (key, value) => {
    expect(normalizeEnvironmentString(`  ${key} = "${value}"  `, key)).toBe(value);
  });

  it('does not alter a value that does not contain its expected variable name', () => {
    expect(normalizeEnvironmentString('API_KEY=keep-this', 'CLOUDINARY_API_KEY')).toBe(
      'API_KEY=keep-this',
    );
  });
});
