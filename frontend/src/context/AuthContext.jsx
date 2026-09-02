import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext(null);

// NOTE: This is a local/mock auth for the static frontend stage.
// Once the backend (authService.js) is ready, replace login()/signup()
// bodies with real API calls and keep the same context shape so
// components using useAuth() don't need to change.

const STORAGE_KEY = "devcollab_user";

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
  const login = ({ name, email, role }) => {
    persist({ name: name || email.split("@")[0], email, role });
  };

  const signup = ({ name, email, role }) => {
    persist({ name, email, role });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}