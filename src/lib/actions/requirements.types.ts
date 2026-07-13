// Shared across the server action and its client form. Kept out of the
// "use server" module, where only async functions may be exported.
export type ImportState = { error: string } | null;
