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
    
    setAuthHeader(response.data.access_token);
    return response.data;
  }, 

  logout: async () => {
    setAuthHeader(null);
  }
};

export default authApi;

