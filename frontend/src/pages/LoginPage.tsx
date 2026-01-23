import { useEffect, useState } from "react";
import { Button, Input } from "@heroui/react";
import { Eye, EyeOff, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import receptionImage from "../assets/images/reception.png";
import { UI } from "@/ui/ui";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [capsLock, setCapsLock] = useState(false);

  const handleLogin = () => {
    setError("");

    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      login();
      setLoading(false);
      navigate("/dashboard", { replace: true });
    }, 1200);
  };

  useEffect(() => {
    const detectCaps = (e: KeyboardEvent) => {
      setCapsLock(e.getModifierState("CapsLock"));
    };
    window.addEventListener("keydown", detectCaps);
    return () => window.removeEventListener("keydown", detectCaps);
  }, []);

  const inputWrapperBase =
    "backdrop-blur-md h-[56px] px-8 rounded-full transition-shadow";

  return (
    <div
      className="relative min-h-screen flex items-center justify-center font-sans overflow-hidden"
      style={{
        backgroundImage: UI.colors.gradient.app,
        color: UI.colors.text.primary,
      }}
    >
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute -left-[10%] -top-[10%] h-[50vh] w-[50vw] rounded-full blur-[140px]"
          style={{ background: UI.colors.glow.purple }}
        />
        <div
          className="absolute -right-[10%] top-[20%] h-[60vh] w-[60vw] rounded-full blur-[140px]"
          style={{ background: UI.colors.glow.blue }}
        />
        <div
          className="absolute bottom-[10%] left-[20%] h-[40vh] w-[40vw] rounded-full blur-[140px]"
          style={{ background: UI.colors.glow.fuchsia }}
        />
      </div>

      <div
        className="relative z-10 w-full max-w-7xl grid grid-cols-1 md:grid-cols-[52%_48%] rounded-3xl overflow-hidden backdrop-blur-xl"
        style={{
          background: UI.colors.surface.glassLg,
          border: `1px solid ${UI.colors.border.strong}`,
          boxShadow: UI.colors.shadow.lg,
        }}
      >
        <div className="hidden md:block relative">
          <img
            src={receptionImage}
            alt="Reception"
            className="h-full w-full object-cover object-center"
          />
          <div
            className="absolute inset-0"
            style={{ background: UI.colors.surface.glassXs }}
          />
        </div>

        <div className="px-14 py-16 flex flex-col justify-center">
          <h1 className="text-4xl font-semibold mb-2">
            Welcome back
          </h1>

          <p
            className="mb-14"
            style={{ color: UI.colors.text.secondary }}
          >
            Please login to your account
          </p>

          <div className="space-y-10">
            <div>
              <label
                className="block text-sm mb-3"
                style={{ color: UI.colors.text.secondary }}
              >
                Email
              </label>

              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                radius="full"
                variant="flat"
                classNames={{
                  base: "w-full",
                  inputWrapper: inputWrapperBase,
                  input:
                    "bg-transparent border-none outline-none text-[15px] h-full p-0 m-0",
                }}
                style={{
                  background: UI.colors.form.inputBg,
                  border: `1px solid ${UI.colors.form.inputBorder}`,
                  boxShadow:
                    error && !email
                      ? `inset 0 0 0 2px ${UI.colors.form.inputError}`
                      : undefined,
                }}
              />
            </div>

            <div className="relative">
              <label
                className="block text-sm mb-3"
                style={{ color: UI.colors.text.secondary }}
              >
                Password
              </label>

              <Input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={showPassword ? "text" : "password"}
                radius="full"
                variant="flat"
                classNames={{
                  base: "w-full",
                  inputWrapper: `${inputWrapperBase} pr-14`,
                  input:
                    "bg-transparent border-none outline-none text-[15px] h-full p-0 m-0",
                }}
                style={{
                  background: UI.colors.form.inputBg,
                  border: `1px solid ${UI.colors.form.inputBorder}`,
                  boxShadow:
                    error && !password
                      ? `inset 0 0 0 2px ${UI.colors.form.inputError}`
                      : undefined,
                }}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 top-[56px] -translate-y-1/2"
                style={{
                  color: UI.colors.text.secondary,
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                {showPassword ? (
                  <EyeOff size={22} strokeWidth={1.75} />
                ) : (
                  <Eye size={22} strokeWidth={1.75} />
                )}
              </button>

              {capsLock && (
                <div
                  className="flex items-center gap-2 mt-2 text-sm"
                  style={{ color: UI.colors.warning }}
                >
                  <AlertTriangle size={14} />
                  Caps Lock is ON
                </div>
              )}
            </div>

            {error && (
              <p
                className="text-sm"
                style={{ color: UI.colors.danger }}
              >
                {error}
              </p>
            )}

            <Button
              radius="full"
              isLoading={loading}
              onPress={handleLogin}
              className="h-[50px] px-14 rounded-full font-medium"
              style={{
                background: UI.colors.accent,
                color: UI.colors.text.inverse,
                boxShadow: UI.colors.shadow.md,
              }}
            >
              Login
            </Button>

            <div className="flex justify-between text-sm mt-10">
              <a
                className="cursor-pointer"
                style={{ color: UI.colors.accent }}
              >
                Forgot password?
              </a>
              <a
                className="cursor-pointer"
                style={{ color: UI.colors.text.secondary }}
              >
                Terms & Conditions
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
