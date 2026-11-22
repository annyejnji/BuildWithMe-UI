
import { describe, expect, it } from 'vitest';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';


const script = fileURLToPath(
  new URL('../../scripts/validate-production-env.mjs', import.meta.url)
);

function validate(
  siteUrl: string,
  repositoryUrl = 'https://github.com/example/repo'
) {
  return spawnSync(process.execPath, [script], {
    encoding: 'utf8',
    env: {
      ...process.env,
      NEXT_PUBLIC_SITE_URL: siteUrl,
      NEXT_PUBLIC_REPOSITORY_URL: repositoryUrl,
    },
  });
}

describe('Production environment validation', () => {

  // TEST 1: url cesty
  it('accepts valid HTTPS URLs', () => {
    const result = validate('https://example.com');

    expect(result.status).toBe(0);
    expect(result.stdout).toContain('Production URLs are valid.');
  });

  // TEST 2: chyba adresa stranky
  it('rejects missing site URL', () => {
    const result = validate('');

    expect(result.status).toBe(1);
    expect(result.stderr).toContain('NEXT_PUBLIC_SITE_URL is required');
  });

  // TEST 3: http miesto https
  it('rejects HTTP instead of HTTPS', () => {
    const result = validate('http://example.com');

    expect(result.status).toBe(1);
    expect(result.stderr).toContain('must use HTTPS');
  });

  // TEST 4: pouzije sa localhost v produkcii
  it('rejects localhost in production', () => {
    const result = validate('https://localhost:3000');

    expect(result.status).toBe(1);
    expect(result.stderr).toContain('cannot point to localhost');
  });

  // TEST 5: zla url repozitara
  it('rejects invalid repository URL', () => {
    const result = validate('https://example.com', 'invalid-url');

    expect(result.status).toBe(1);
    expect(result.stderr).toContain('must be a valid absolute URL');
  });
});
