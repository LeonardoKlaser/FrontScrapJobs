import type { Plan } from "./plan";

export interface User {
  id: string | undefined;
  user_name: string | undefined;
  email: string | undefined;
  plan: Plan | undefined;
}