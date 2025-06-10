import React, { useState } from "react";
import { useAuthStore } from "../stores/useAuthStore";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const login = useAuthStore((s) => s.login);
  const loading = useAuthStore((s) => s.isLoading);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await login(username, password);
      if (useAuthStore.getState().isAuthenticated) {
        setError(null);
        navigate("/dashboard");
      } else {
        setError("Invalid username or password");
      }
    } catch (err) {
      setError(useAuthStore.getState().error || "Login failed");
      console.error("Login error:", err);
    }
  };

  return (
    <div className="flex lg:items-center bg-base-100 justify-center  p-3 lg:p-10 mx-auto">
      <div className="flex w-full justify-center">
        <div className="lg:w-1/2 flex flex-col min-h-screen gap-8 justify-center bg-base-200 px-3 lg:p-10 rounded-3xl lg:rounded-l-3xl border border-base-300">
          <div className="flex justify-center">
            <img src="/logo.png" alt="" className="w-80 flex justify-center" />
          </div>

          {/* Heading */}
          <div className="flex flex-col text-center gap-2 justify-center items-center mb-6">
            <h1 className="text-2xl lg:text-3xl font-bold ">
              Let’s accomplish more together
            </h1>
            <p className="text-neutral">
              Create a user name and a password to activate your account
            </p>
          </div>

          {error && <div className="p-4 rounded mb-4">{error}</div>}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="form-control">
              <label htmlFor="username" className="label">
                <span className="label-text mb-3">Username</span>
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input input-bordered w-full"
              />
            </div>
            <div className="form-control">
              <label htmlFor="password" className="label">
                <span className="label-text mb-3">Password</span>
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input input-bordered w-full"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className={`btn btn-primary rounded-xl mt-3 w-full ${
                loading ? "loading" : ""
              }`}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
        <img
          src="/bg2.jpg"
          className="hidden lg:block w-1/3 rounded-r-3xl"
          alt="construction-img"
        />
      </div>
    </div>
  );
}
