import { describe, expect, it } from 'vitest';

import { normalizeEnvironmentString } from '../src/config/env-value';

describe('environment value normalization', () => {
  it('accepts a Cloudinary value copied from an env-file assignment', () => {
    expect(
      normalizeEnvironmentString(
        '  CLOUDINARY_CLOUD_NAME = "demo-cloud"  ',
        'CLOUDINARY_CLOUD_NAME',
      ),
    ).toBe('demo-cloud');
  });

  it('does not alter a value that does not contain its expected variable name', () => {
    expect(normalizeEnvironmentString('API_KEY=keep-this', 'CLOUDINARY_API_KEY')).toBe(
      'API_KEY=keep-this',
    );
  });
});
