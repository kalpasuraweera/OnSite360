import React, { useState } from "react";
import { useAuthStore } from "../stores/useAuthStore";
import { useNavigate } from "react-router-dom";
import TextInput from "../components/TextInput";
import PasswordInput from "../components/PasswordInput";
import Button from "../components/Button";
import ErrorMsg from "../components/Error";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const login = useAuthStore((s) => s.login);
  const loading = useAuthStore((s) => s.isLoading);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await login(email, password);
      if (useAuthStore.getState().isAuthenticated) {
        setError("");
        navigate("/dashboard");
      } else {
        setError("Invalid username or password");
      }
    } catch {
      setError(useAuthStore.getState().error || "Login failed");
    }
  };

  return (
    <div className="xl:p-1 bg-base-100 flex justify-center h-full items-center w-full">
      <div className="w-full  rounded-4xl gap-1 flex ">
        <div className="hidden xl:relative xl:flex w-[850px] flex-col justify-end items-center">
          <div className="flex flex-col gap-5 text-black absolute z-40 p-20 w-full rounded-3xl top-0">
            <div>
              <h1 className="text-5xl font-bold">Welcome to OnSite360</h1>
              <p>Construction Project Management Software</p>
            </div>
            <p className="text-">
              OnSite360 is your all-in-one solution for managing construction
              projects efficiently. From daily logs to workforce management, we
              provide the tools you need to streamline operations and enhance
              productivity.
            </p>
          </div>

          <img
            src="/construction.jpg"
            className="h-2/3 object-cover z-10 rounded-3xl mb-0 mt-auto"
            alt="construction-img"
          />
        </div>
        <div className="bg-base-200 h-screen flex flex-col flex-1 rounded-3xl p-5 xl:p-5">
          <Button variant="back" />
          <div className="flex justify-center mt-36">
            <img src="/logo.png" alt="" className="w-80 flex justify-center" />
          </div>

          {error && <ErrorMsg>{error}</ErrorMsg>}

          <form
            onSubmit={handleLogin}
            className="flex flex-col justify-evenly h-screen p-5 xl:px-10"
          >
            <div className="flex gap-5 flex-col">
              <TextInput
                id="email"
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <PasswordInput
                id="password"
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
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
      </div>
    </div>
  );
}
