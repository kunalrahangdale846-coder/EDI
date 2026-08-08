import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../components/common/Input.jsx";
import Button from "../components/common/Button.jsx";
import { useAuth } from "../hooks/useAuth.js";
import { ROLES, ROUTES } from "../utils/constants.js";

function Login() {
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: ROLES.STUDENT,
  });
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // No backend yet - this just sets the local session so the
    // Dashboard has a real role to branch on.
    if (mode === "login") {
      login({ email: form.email, role: form.role });
    } else {
      signup({ name: form.name, email: form.email, role: form.role });
    }
    navigate(ROUTES.DASHBOARD);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-2xl font-semibold text-slate-900">
        {mode === "login" ? "Log in" : "Create an account"}
      </h1>

      <div className="mt-4 flex gap-2 text-sm">
        <button
          type="button"
          onClick={() => setMode("login")}
          className={`px-3 py-1 rounded ${mode === "login" ? "bg-slate-900 text-white" : "text-slate-600"}`}
        >
          Login
        </button>
        <button
          type="button"
          onClick={() => setMode("signup")}
          className={`px-3 py-1 rounded ${mode === "signup" ? "bg-slate-900 text-white" : "text-slate-600"}`}
        >
          Sign up
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        {mode === "signup" && (
          <Input
            label="Full name"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Your name"
            required
          />
        )}

        <Input
          label="Email"
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="you@example.com"
          required
        />

        <Input
          label="Password"
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          placeholder="••••••••"
          required
        />

        <div>
          <p className="text-sm font-medium text-slate-700 mb-2">
            {mode === "signup" ? "I am signing up as" : "Log in as"}
          </p>
          <div className="flex gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="role"
                value={ROLES.STUDENT}
                checked={form.role === ROLES.STUDENT}
                onChange={handleChange}
              />
              Student (submits projects)
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="role"
                value={ROLES.ORGANIZER}
                checked={form.role === ROLES.ORGANIZER}
                onChange={handleChange}
              />
              Organizer (creates hackathons)
            </label>
          </div>
        </div>

        <Button type="submit" variant="primary" className="mt-2">
          {mode === "login" ? "Log in" : "Sign up"}
        </Button>
      </form>
    </div>
  );
}

export default Login;