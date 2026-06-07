import React, { useState } from "react";
import { registerUser, loginUser, googleLogin } from "../services/auth";
import { 
  ShoppingBag, 
  Mail, 
  Lock, 
  User, 
  Sparkles, 
  ArrowRight,
  ShieldAlert,
  HelpCircle,
  RefreshCw
} from "lucide-react";
import { signInAnonymously } from "firebase/auth";
import { auth, db } from "../services/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { UserProfile } from "../types";

interface LoginProps {
  onLoginSuccess?: (profile: UserProfile) => void;
  onSimulateLogin?: (role: "buyer" | "seller" | "admin") => void;
}

export default function Login({ onLoginSuccess, onSimulateLogin }: LoginProps) {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (isRegisterMode && !name)) {
      setErrorMessage("Please fill in all required fields.");
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      if (isRegisterMode) {
        await registerUser(email, password, name);
        setSuccessMessage("Registered successfully! Welcome aboard.");
        setTimeout(() => {
          if (onLoginSuccess) {
            // Success handler will pick up profile through onAuthStateChanged
          }
        }, 1200);
      } else {
        await loginUser(email, password);
        setSuccessMessage("Logged in successfully!");
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === "auth/email-already-in-use") {
        setErrorMessage("This email address is already in use.");
      } else if (err.code === "auth/weak-password") {
        setErrorMessage("Password must be at least 6 characters.");
      } else if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password" || err.code === "auth/user-not-found") {
        setErrorMessage("Incorrect email or password combination.");
      } else {
        setErrorMessage(err.message || "An authentication error occurred.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleAuth = async () => {
    setErrorMessage("");
    setSuccessMessage("");
    setIsSubmitting(true);
    try {
      await googleLogin();
      setSuccessMessage("Authenticated with Google!");
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Google Authentication was cancelled or blocked.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-8 bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm">
      {/* Brand Header */}
      <div className="text-center mb-6">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 mb-3 border border-indigo-100/40">
          <ShoppingBag className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-black text-slate-900 tracking-tight">
          Shop<span className="text-indigo-600">Easy</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1 font-medium">Access your global developer sandbox account</p>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-50 border border-slate-100 p-1.5 rounded-xl mb-6">
        <button
          type="button"
          onClick={() => {
            setIsRegisterMode(false);
            setErrorMessage("");
            setSuccessMessage("");
          }}
          className={`flex-1 text-xs py-2 rounded-lg font-bold transition-all ${
            !isRegisterMode 
              ? "bg-white text-indigo-600 shadow-sm" 
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => {
            setIsRegisterMode(true);
            setErrorMessage("");
            setSuccessMessage("");
          }}
          className={`flex-1 text-xs py-2 rounded-lg font-bold transition-all ${
            isRegisterMode 
              ? "bg-white text-indigo-600 shadow-sm" 
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Create Account
        </button>
      </div>

      {/* Error/Success Feedbacks */}
      {errorMessage && (
        <div className="bg-red-50 text-red-700 text-xs py-2.5 px-3.5 rounded-xl border border-red-100 mb-4 font-semibold flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-red-600 animate-pulse flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
      {successMessage && (
        <div className="bg-emerald-50 text-emerald-700 text-xs py-2.5 px-3.5 rounded-xl border border-emerald-100 mb-4 font-semibold flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-ping flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Custom Credentials Form */}
      <form onSubmit={handleEmailAuth} className="space-y-4">
        {isRegisterMode && (
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Your Full Name</label>
            <div className="relative">
              <input
                type="text"
                required
                disabled={isSubmitting}
                placeholder="e.g. Johnathan Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 outline-none transition focus:bg-white focus:border-indigo-500 font-medium"
              />
              <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            </div>
          </div>
        )}

        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email Address</label>
          <div className="relative">
            <input
              type="email"
              required
              disabled={isSubmitting}
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 outline-none transition focus:bg-white focus:border-indigo-500 font-medium"
            />
            <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Secure Password</label>
          <div className="relative">
            <input
              type="password"
              required
              disabled={isSubmitting}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 outline-none transition focus:bg-white focus:border-indigo-500 font-medium"
            />
            <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-slate-900 border border-slate-850 hover:bg-indigo-600 transition duration-200 text-white font-black text-xs py-3 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <RefreshCw className="h-4 w-4 animate-spin text-white" />
          ) : (
            <>
              <span>{isRegisterMode ? "Create My Account" : "Access ShopEasy"}</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      {/* Social Divider */}
      <div className="relative my-5 text-center">
        <span className="bg-white px-2 text-[10px] text-slate-400 font-bold uppercase z-10 relative">Or authenticate with</span>
        <hr className="absolute top-2.5 w-full border-slate-100" />
      </div>

      {/* Google Login button */}
      <button
        type="button"
        disabled={isSubmitting}
        onClick={handleGoogleAuth}
        className="w-full border border-slate-250 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs py-2.5 rounded-xl transition duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
      >
        <svg className="h-4.5 w-4.5" viewBox="0 0 24 24">
          <path
            fill="#EA4335"
            d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582l3.51-3.51C17.642 1.09 14.97 0 12 0 7.354 0 3.307 2.67 1.258 6.56l4.008 3.205z"
          />
          <path
            fill="#34A853"
            d="M16.04 15.345c-1.077.733-2.502 1.155-4.04 1.155a7.062 7.062 0 0 1-6.734-4.855l-4.008 3.205C3.307 21.33 7.354 24 12 24c3.155 0 6.014-1.023 8.218-2.782l-4.178-5.873z"
          />
          <path
            fill="#4285F4"
            d="M24 12c0-.859-.07-1.69-.214-2.5H12v4.8h6.73c-.29 1.577-1.18 2.91-2.51 3.8l4.178 5.873C22.84 21.396 24 17.073 24 12z"
          />
          <path
            fill="#FBBC05"
            d="M5.266 14.235A7.086 7.086 0 0 1 4.909 12c0-.791.132-1.55.357-2.235L1.258 6.56A11.96 11.96 0 0 0 0 12c0 1.95.47 3.795 1.258 5.44l4.008-3.205z"
          />
        </svg>
        <span>Continue with Google</span>
      </button>

      {/* Instant Sandbox Evaluator profiles if simulated login is passed */}
      {onSimulateLogin && (
        <div className="mt-6 border-t border-dashed border-slate-100 pt-5 text-center">
          <div className="flex items-center justify-center gap-1.5 text-[10px] uppercase tracking-wider font-extrabold text-indigo-600 mb-3 bg-indigo-50/50 py-1 px-2.5 rounded-full w-fit mx-auto">
            <Sparkles className="h-3 w-3 animate-pulse" />
            <span>Developer Sandbox Accounts</span>
          </div>
          <p className="text-[11px] text-slate-400 mb-4 font-medium leading-relaxed">
            Instantly log in using sandbox identities to test complete UI permissions and roles without registration:
          </p>
          <div className="grid grid-cols-3 gap-2 text-[10px] font-extrabold">
            <button
              type="button"
              onClick={() => onSimulateLogin("buyer")}
              className="bg-slate-50 hover:bg-indigo-50 text-indigo-600 border border-slate-100 p-2 rounded-xl transition duration-200"
            >
              Demo Buyer
            </button>
            <button
              type="button"
              onClick={() => onSimulateLogin("seller")}
              className="bg-slate-50 hover:bg-violet-50 text-violet-600 border border-slate-100 p-2 rounded-xl transition duration-200"
            >
              Demo Seller
            </button>
            <button
              type="button"
              onClick={() => onSimulateLogin("admin")}
              className="bg-slate-50 hover:bg-rose-50 text-rose-600 border border-slate-100 p-2 rounded-xl transition duration-200"
            >
              Demo Admin
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
