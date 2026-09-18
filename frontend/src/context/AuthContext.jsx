import { createContext, useCallback, useContext, useEffect, useState } from "react";

import { api, clearToken, getToken, login as apiLogin, setToken } from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadCurrentUser = useCallback(async () => {
    if (!getToken()) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      const me = await api.get("/me");
      setUser(me);
    } catch {
      // το token είναι άκυρο/έληξε
      clearToken();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCurrentUser();
  }, [loadCurrentUser]);

  async function login(institutionalEmail, password) {
    const { access_token } = await apiLogin(institutionalEmail, password);
    setToken(access_token);
    await loadCurrentUser();
  }

  function logout() {
    clearToken();
    setUser(null);
  }

  async function register({ institutionalEmail, password, fullName }) {
    await api.post("/auth/register", {
      institutional_email: institutionalEmail,
      password,
      full_name: fullName,
    });
  }

  const value = { user, isLoading, login, logout, register };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth πρέπει να καλείται μέσα σε AuthProvider");
  }
  return context;
}
