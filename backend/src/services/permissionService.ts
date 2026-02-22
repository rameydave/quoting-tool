import { Role } from "../types/domain.js";

export function canUpdateMasterPrice(role: Role): boolean {
  return role === "pricing_admin" || role === "admin";
}

export function canImportParts(role: Role): boolean {
  return role === "admin";
}
