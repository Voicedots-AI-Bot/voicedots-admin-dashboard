import { apiClient, setAuthHeader } from './apiClient';

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

const authApi = {
  login: async (
    email: string,
    password: string
  ): Promise<LoginResponse> => {
    const form = new URLSearchParams();

    form.append("email", email);
    form.append("password", password);

    const response = await apiClient.post<LoginResponse>("/v1/auth/login",
      form,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    console.log("Login response received:", response.data);
    setAuthHeader(response.data.access_token);
    console.log("Login successful, token set in header.");
    return response.data;
  },
};

export default authApi;

