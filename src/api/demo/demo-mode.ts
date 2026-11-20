/**
 * Demo mode: in-memory data and no auth, for local visual QA only.
 *
 * `process.env.NODE_ENV` is inlined by Next at build time, so in any production
 * build this constant is the literal `false` and every demo branch is dead code.
 */
export const DEMO_MODE: boolean =
  process.env.NODE_ENV === 'development' && process.env.PACE_DEMO === '1';
