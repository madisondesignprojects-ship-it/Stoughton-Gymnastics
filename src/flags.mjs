// Feature flags. Flip SHOW_COACHES to true (or build with SHOW_COACHES=true)
// ONLY after the gym approves publishing the coach page (build script 9.15).
export const SHOW_COACHES = process.env.SHOW_COACHES === 'true';
// Optional dismissible notice banner (7.13). Off by default.
export const SHOW_NOTICE_BANNER = process.env.SHOW_NOTICE_BANNER === 'true';
