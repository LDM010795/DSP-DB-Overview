import axios from "axios";

const BASE_URL = "http://localhost:8000/api/elearning";

export interface TokenResponse {
  access: string;
  refresh: string;
}

export const authService = {
  async login(username: string, password: string): Promise<TokenResponse> {
    const res = await axios.post<TokenResponse>(`${BASE_URL}/token/`, {
      username,
      password,
    });
    return res.data;
  },
  logout() {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
  },
  isAuthenticated() {
    return !!localStorage.getItem("access");
  },
}; 