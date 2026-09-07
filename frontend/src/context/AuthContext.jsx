import { useEffect, useState } from "react";
import { authApi, unwrap } from "../services/api";
import { AuthContext } from "./authContext";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authApi
      .currentUser()
      .then((response) => setUser(unwrap(response)))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (payload) => {
    const response = await authApi.login(payload);
    const loggedInUser = unwrap(response)?.user ?? unwrap(response);
    setUser(loggedInUser);
    return loggedInUser;
  };
  const register = async (payload) => unwrap(await authApi.register(payload));
  const logout = async () => {
    await authApi.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, setUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}
