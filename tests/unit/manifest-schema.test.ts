
import { describe, expect, it } from 'vitest';
import { componentManifestSchema } from '../../src/registry/schema';

const frameworkSchema =
  componentManifestSchema.shape.frameworks.shape.react;

const idSchema = componentManifestSchema.shape.id;

function framework(dependencies: Record<string, string>) {
  return {
    source: 'button.tsx',
    exportName: 'Button',
    usage: '<Button />',
    dependencies,
  };
}

describe('Component manifest validation', () => {

  // TEST 1: testujem platnost nazvov
  it('accepts valid component IDs', () => {
    expect(idSchema.safeParse('button').success).toBe(true);
    expect(idSchema.safeParse('magnetic-button').success).toBe(true);
  });

  // TEST 2: neplatne nazvy
  it('rejects invalid component IDs', () => {
    expect(idSchema.safeParse('Invalid Name').success).toBe(false);
    expect(idSchema.safeParse('button_name').success).toBe(false);
    expect(idSchema.safeParse('-button').success).toBe(false);
  });

  // TEST 3: verzia zavislosti
  it('accepts exact dependency versions', () => {
    const result = frameworkSchema.safeParse(
      framework({ react: '19.3.0' })
    );

    expect(result.success).toBe(true);
  });

  // TEST 4: neplatny zapis verzii
  it('rejects non-exact dependency versions', () => {
    const versions = ['^19.0.0', '~19.0.0', 'latest'];

    for (const version of versions) {
      const result = frameworkSchema.safeParse(
        framework({ react: version })
      );

      expect(result.success).toBe(false);
    }
  });

  // TEST 5: zly nazov zavisloti
  it('rejects invalid dependency names', () => {
    const result = frameworkSchema.safeParse(
      framework({ 'Invalid Package': '1.0.0' })
    );

    expect(result.success).toBe(false);
  });

  // TEST 6: prazdny nazov zdrojaku
  it('rejects empty source file names', () => {
    const result = frameworkSchema.safeParse({
      ...framework({}),
      source: '   ',
    });

    expect(result.success).toBe(false);
  });

  // TEST 7: platna URL autora komponenzu
  it('accepts valid HTTPS creator URL', () => {
    const result =
      componentManifestSchema.shape.provenance.safeParse({
        type: 'original',
        creator: {
          name: 'Developer',
          url: 'https://example.com',
        },
        license: 'MIT',
      });

    expect(result.success).toBe(true);
  });

  // TEST 8: nepodporovany protokol url
  it('rejects unsupported creator URL protocol', () => {
    const result =
      componentManifestSchema.shape.provenance.safeParse({
        type: 'original',
        creator: {
          name: 'Developer',
          url: 'ftp://example.com',
        },
        license: 'MIT',
      });

    expect(result.success).toBe(false);
  });
});
