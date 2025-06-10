import React, { useState } from "react";
import { useAuthStore } from "../stores/useAuthStore";
import { useNavigate } from "react-router-dom";
import TextInput from "../components/TextInput";
import Button from "../components/Button";
import ErrorMsg from "../components/Error";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const login = useAuthStore((s) => s.login);
  const loading = useAuthStore((s) => s.isLoading);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await login(email, password);
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
          <Button variant="back" />
          <div className="flex justify-center mt-20 lg:mt-28">
            <img src="/logo.png" alt="" className="w-80 flex justify-center" />
          </div>

          {/* Heading */}
          <div className="flex flex-col text-center lg:gap-2 justify-center items-center mb-6">
            <h1 className="text-2xl lg:text-3xl font-bold ">
              Let’s accomplish more together
            </h1>
            <p className="text-neutral text-sm">
              Create a user name and a password to activate your account
            </p>
          </div>

          {error && <ErrorMsg>{error}</ErrorMsg>}

          <form onSubmit={handleLogin} className="space-y-4">
            <TextInput
              id="email"
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextInput
              id="password"
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? (
                <span className="loading loading-spinner text-primary"></span>
              ) : (
                "Login"
              )}
            </Button>
          </form>
        </div>
        <img
          src="/bg2.jpg"
          className="hidden lg:block w-1/2 rounded-r-3xl"
          alt="construction-img"
        />
      </div>
    </div>
  );
}
