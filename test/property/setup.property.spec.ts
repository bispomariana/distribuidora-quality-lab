import * as fc from 'fast-check';

describe('Project Setup Verification', () => {
  it('fast-check is configured and runs property tests with 100 iterations', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 1000 }), (n) => {
        return n >= 1 && n <= 1000;
      }),
      { numRuns: 100 },
    );
  });
});
