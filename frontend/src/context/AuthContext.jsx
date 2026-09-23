import { useState, useEffect } from "react";
import { loginUser, registerUser } from "../services/authService.js";
import { AuthContext } from "./authContext.js";

const STORAGE_KEY = "devcollab_user";
const TOKEN_KEY = "devcollab_token";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setUser(JSON.parse(stored));
    }
    setLoading(false);
  }, []);

  const persist = (nextUser) => {
    setUser(nextUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
  };

  // role: "organizer" | "student"
  const login = async ({ email, password }) => {
    const response = await loginUser({ email, password });
    persist(response.user);
    localStorage.setItem(TOKEN_KEY, response.token);
  };

  const signup = async ({ name, email, password, role }) => {
    const response = await registerUser({
      name,
      email,
      password,
      role: role === "student" ? "PARTICIPANT" : "ORGANIZER",
    });
    persist(response.user);
    localStorage.setItem(TOKEN_KEY, response.token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TOKEN_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}