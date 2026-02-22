import { QuoteInput, Role } from "../types/domain.js";

export const store = {
  quotes: new Map<string, QuoteInput>(),
  audit: [] as Record<string, unknown>[],
  parts: new Map<string, { id: string; partNumber: string; description: string; cost: number }>(),
  users: new Map<string, { id: string; email: string; role: Role; fullName: string }>(),
};
