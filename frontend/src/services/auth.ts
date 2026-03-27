/* Auth API calls. */

import api from "./api";
import type { TokenResponse, User } from "../types";

export const authService = {
  login: (email: string, password: string) =>
    api.post<TokenResponse>("/auth/login", { email, password }),

  register: (email: string, full_name: string, password: string) =>
    api.post<User>("/auth/register", { email, full_name, password }),

  me: () => api.get<User>("/auth/me"),
};
