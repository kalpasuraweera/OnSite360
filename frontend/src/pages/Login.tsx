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
    <div className="lg:p-1 bg-base-100 flex justify-center h-full items-center w-full">
      <div className="w-full  rounded-4xl gap-1 flex ">
        <div className="hidden lg:relative lg:flex">
          <div className="flex flex-col gap-5 text-white  absolute z-40 p-20 w-full backdrop-blur-md rounded-3xl">
            <div>
              <h1 className="text-5xl font-bold">Welcome to OnSite360</h1>
              <p>Construction Project Management Software</p>
            </div>
            <p className="text-">
              Lorem Ipsum is simply dummy text of the printing and typesetting
              industry. Lorem Ipsum has been the industry's standard dummy text
              ever since the 1500s, when an unknown printer took a galley of
              type and scrambled it to make a type specimen book. It has
              survived not only five centuries, but also the leap into
              electronic typesetting, remaining essentially unchanged.
            </p>
          </div>

          <img
            src="/construction.jpg"
            className="w-[850px]  z-10 rounded-3xl"
            alt="construction-img"
          />
        </div>
        <div className="bg-base-200 h-screen flex flex-col flex-1 rounded-3xl p-5 lg:p-5">
          <Button variant="back" />
          <div className="flex justify-center mt-36">
            <img src="/logo.png" alt="" className="w-80 flex justify-center" />
          </div>

          {error && <ErrorMsg>{error}</ErrorMsg>}

          <form
            onSubmit={handleLogin}
            className="flex flex-col justify-evenly h-screen p-5 lg:px-10"
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
