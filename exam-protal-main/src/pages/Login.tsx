import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/services/api";
import logo from "@/assets/trinetra-logo.png";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email.trim()) return alert("Enter email");
    if (!password.trim()) return alert("Enter password");

    try {
      setLoading(true);
      const data = await api.login(email, password);
      login(data.token, data.user);
      navigate("/exam-selection");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-6 rounded-xl shadow w-full max-w-md">
        <div className="flex justify-center mb-4">
          <img src={logo} alt="Trinetra Logo" className="h-16 object-contain" />
        </div>

        <p className="text-center text-gray-500 mb-4">Sign in to access your exams</p>
        <h2 className="text-xl font-bold mb-3 text-center">Welcome Back</h2>

        <input
          type="email"
          placeholder="Enter Gmail"
          className="w-full border p-2 mb-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div className="relative mb-3">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Enter password"
            className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />
          <span
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-2.5 cursor-pointer text-gray-500"
          >
            {showPassword ? "🙈" : "👁️"}
          </span>
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white p-2 rounded font-medium transition-colors"
        >
          {loading ? "Please wait..." : "Sign In"}
        </button>

        <p className="text-sm text-center mt-3 text-gray-600">
          Don’t have an account?{" "}
          <span
            className="text-blue-500 cursor-pointer font-medium hover:underline"
            onClick={() => navigate("/register")}
          >
            Register
          </span>
        </p>
      </div>
    </div>
  );
}
