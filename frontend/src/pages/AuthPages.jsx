import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

function AuthLayout({ mode, children }) {
  return (
    <div className="auth-page">
      <div className="auth-aside">
        <Link to="/" className="brand">
          <span className="brand-mark">▶</span>
          <span>
            Stream<span>Hub</span>
          </span>
        </Link>
        <div>
          <p className="eyebrow">A place for your perspective</p>
          <h1>
            Find your next
            <br />
            <em>favorite thing.</em>
          </h1>
          <p className="auth-aside-copy">
            Watch deeply, share freely, and discover creators who make the
            internet feel human.
          </p>
        </div>
        <p className="auth-footer">
          {mode === "login" ? "New to StreamHub?" : "Already have an account?"}{" "}
          <Link to={mode === "login" ? "/register" : "/login"}>
            {mode === "login" ? "Create an account" : "Sign in"}
          </Link>
        </p>
      </div>
      {children}
    </div>
  );
}

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await login(form);
      navigate(location.state?.from?.pathname || "/");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "We could not sign you in. Check your details and try again.",
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <AuthLayout mode="login">
      <div className="auth-form-wrap">
        <div>
          <p className="eyebrow">Welcome back</p>
          <h2>Sign in to your world.</h2>
          <p className="form-intro">Pick up where you left off.</p>
        </div>
        <form onSubmit={submit} className="auth-form">
          <label>
            Username
            <input
              required
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
            />
          </label>
          <label>
            Password
            <input
              required
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </label>
          {error && <p className="form-error">{error}</p>}
          <button className="button" disabled={busy}>
            {busy ? "Signing in..." : "Sign in →"}
          </button>
        </form>
        <p className="mobile-switch">
          New to StreamHub? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </AuthLayout>
  );
}

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
  });
  const [files, setFiles] = useState({ avatar: null, coverImage: null });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const payload = new FormData();
      Object.entries(form).forEach(([key, value]) =>
        payload.append(key, value),
      );
      payload.append("avatar", files.avatar);
      if (files.coverImage) payload.append("coverImage", files.coverImage);
      await register(payload);
      navigate("/login");
    } catch (err) {
      setError(
        err.response?.data?.message || "We could not create your account yet.",
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <AuthLayout mode="register">
      <div className="auth-form-wrap">
        <div>
          <p className="eyebrow">Join the community</p>
          <h2>
            Make room for
            <br />
            something new.
          </h2>
          <p className="form-intro">Your corner of the internet starts here.</p>
        </div>
        <form onSubmit={submit} className="auth-form">
          <label>
            Full name
            <input
              required
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            />
          </label>
          <label>
            Username
            <input
              required
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
            />
          </label>
          <label>
            Email
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </label>
          <label>
            Password
            <input
              required
              minLength="6"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </label>
          <label>
            Avatar
            <input
              required
              type="file"
              accept="image/*"
              onChange={(e) =>
                setFiles({ ...files, avatar: e.target.files?.[0] || null })
              }
            />
          </label>
          <label>
            Cover image <span className="field-hint">Optional</span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setFiles({ ...files, coverImage: e.target.files?.[0] || null })
              }
            />
          </label>
          {error && <p className="form-error">{error}</p>}
          <button className="button" disabled={busy}>
            {busy ? "Creating account..." : "Create account →"}
          </button>
        </form>
        <p className="mobile-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </AuthLayout>
  );
}
