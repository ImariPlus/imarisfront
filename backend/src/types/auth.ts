export type Role = "ADMIN" | "FINANCE" | "USER";

export interface JwtUser {
  id: string;
  role: Role;
}
