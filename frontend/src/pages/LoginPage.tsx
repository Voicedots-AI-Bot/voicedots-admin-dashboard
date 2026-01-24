import { useState } from "react";
import { Eye, EyeOff, ShieldCheck, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter your administrator credentials.");
      return;
    }

    setLoading(true);
    // Simulate API Auth
    setTimeout(() => {
      login();
      setLoading(false);
      navigate("/dashboard", { replace: true });
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 dark:bg-slate-900">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo / Brand */}
        <div className="flex justify-center items-center gap-2 mb-6">
          <div className="bg-blue-600 p-2 rounded-lg">
            <ShieldCheck className="text-white w-8 h-8" />
          </div>
          <span className="text-2xl font-bold text-gray-800 dark:text-white tracking-tight">
            voicedots<span className="text-blue-600">.</span>
          </span>
        </div>
        
        <h2 className="text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          Admin Portal
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Secure access for authorized personnel only
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white dark:bg-slate-800 py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-gray-200 dark:border-slate-700">
          <form className="space-y-6" onSubmit={handleLogin}>
            
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-sm text-red-800 rounded-lg p-4 dark:bg-red-800/10 dark:border-red-900 dark:text-red-500 flex items-center gap-2" role="alert">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Email Address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="py-3 px-4 block w-full border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-slate-900 dark:border-slate-700 dark:text-gray-400 dark:focus:ring-gray-600"
                  placeholder="admin@voicedots.com"
                />
              </div>
            </div>

            <div className="relative">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="py-3 px-4 block w-full border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-slate-900 dark:border-slate-700 dark:text-gray-400 dark:focus:ring-gray-600"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-blue-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="shrink-0 mt-0.5 border-gray-200 rounded text-blue-600 focus:ring-blue-500 dark:bg-slate-900 dark:border-slate-700 dark:checked:bg-blue-500 dark:checked:border-blue-500 dark:focus:ring-offset-gray-800"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-800 dark:text-gray-300">
                  Trust this device
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
                  Forgot password?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none transition-all shadow-sm"
              >
                {loading ? (
                  <span className="animate-spin inline-block w-4 h-4 border-[2px] border-current border-t-transparent text-white rounded-full" role="status" aria-label="loading"></span>
                ) : null}
                Sign in to Dashboard
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-slate-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-slate-800 text-gray-500">Security Verified</span>
              </div>
            </div>
          </div>
        </div>
        
        <p className="mt-8 text-center text-xs text-gray-400 dark:text-gray-500">
          &copy; 2026 voicedots. All rights reserved. <br />
          Protected by industry-standard encryption.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;