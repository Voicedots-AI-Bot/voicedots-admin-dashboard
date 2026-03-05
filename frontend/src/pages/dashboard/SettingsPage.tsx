import { useState, useRef, useEffect } from "react";
import { User, Mail, Upload, Lock, Shield, Camera, KeyRound } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import usersApi from "@/api/usersApi";

export default function SettingsPage() {
  const { user, refreshUser } = useAuth();

  // Profile State
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [profilePicture, setProfilePicture] = useState(user?.profile_picture || "");
  const [profileCurrentPassword, setProfileCurrentPassword] = useState("");

  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Security State
  const [secCurrentPassword, setSecCurrentPassword] = useState("");
  const [secNewPassword, setSecNewPassword] = useState("");
  const [secConfirmPassword, setSecConfirmPassword] = useState("");

  const [secError, setSecError] = useState("");
  const [secSuccess, setSecSuccess] = useState("");
  const [isSavingSecurity, setIsSavingSecurity] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setProfilePicture(user.profile_picture || "");
    }
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setProfileError("Please upload a valid image file.");
      return;
    }

    if (file.size > 1 * 1024 * 1024) {
      setProfileError("Image must be less than 1MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setProfilePicture(base64String);
      setProfileError("");
    };
    reader.readAsDataURL(file);
  };

  const resetProfileMessages = () => {
    setProfileError("");
    setProfileSuccess("");
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetProfileMessages();

    const isChangingSensitiveInfo = (name !== user?.name) || (email !== user?.email);

    if (isChangingSensitiveInfo && !profileCurrentPassword) {
      setProfileError("Current password is required to change name or email.");
      return;
    }

    try {
      setIsSavingProfile(true);

      const payload: any = {};
      if (name !== user?.name) payload.name = name;
      if (email !== user?.email) payload.email = email;
      if (profilePicture !== user?.profile_picture) payload.profile_picture = profilePicture;

      if (Object.keys(payload).length === 0) {
        setProfileSuccess("No changes to save.");
        setIsSavingProfile(false);
        return;
      }

      if (isChangingSensitiveInfo) {
        payload.current_password = profileCurrentPassword;
      }

      await usersApi.updateMe(payload);
      await refreshUser();

      setProfileSuccess("Profile updated successfully!");
      setProfileCurrentPassword("");
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      const msg = typeof detail === 'string' ? detail : Array.isArray(detail) ? detail.map((d: any) => d.msg).join(', ') : "Failed to update profile. Please check your password.";
      setProfileError(msg);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const resetSecurityMessages = () => {
    setSecError("");
    setSecSuccess("");
  };

  const handleSecuritySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetSecurityMessages();

    if (!secCurrentPassword || !secNewPassword || !secConfirmPassword) {
      setSecError("All fields are required.");
      return;
    }

    if (secNewPassword !== secConfirmPassword) {
      setSecError("New passwords do not match.");
      return;
    }

    if (secNewPassword.length < 6) {
      setSecError("Password must be at least 6 characters.");
      return;
    }

    try {
      setIsSavingSecurity(true);
      await usersApi.updatePassword({
        current_password: secCurrentPassword,
        new_password: secNewPassword
      });

      setSecSuccess("Password updated successfully!");
      setSecCurrentPassword("");
      setSecNewPassword("");
      setSecConfirmPassword("");
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      const msg = typeof detail === 'string' ? detail : Array.isArray(detail) ? detail.map((d: any) => d.msg).join(', ') : "Failed to update password.";
      setSecError(msg);
    } finally {
      setIsSavingSecurity(false);
    }
  };

  const initials = user?.name ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2) : "U";

  return (
    <div className="w-full px-4 sm:px-8 py-6 max-w-5xl mx-auto max-h-[calc(100vh-64px)] overflow-y-auto custom-scrollbar">
      {/* Page title area */}
      <div className="mb-8 sm:mb-10">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
          Account Settings
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Manage your profile information and security preferences.
        </p>
      </div>

      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Main Content Area */}
        <div className="lg:col-span-12 space-y-8">

          {/* PROFILE SECTION */}
          <section className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-gray-200/60 dark:border-slate-800 overflow-hidden relative transition-all hover:shadow-md">
            {/* Header decoration */}
            <div className="h-24 sm:h-32 bg-gradient-to-r from-blue-600 to-indigo-600 w-full relative">
              <div className="absolute inset-0 bg-white/10 dark:bg-black/10 backdrop-blur-sm"></div>
            </div>

            <div className="px-6 sm:px-10 pb-8 sm:pb-10 -mt-12 sm:-mt-16 relative z-10">
              <form onSubmit={handleProfileSubmit}>

                {/* Avatar */}
                <div className="flex flex-col sm:flex-row gap-6 sm:items-end mb-8">
                  <div className="relative group shrink-0">
                    <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-full ring-4 ring-white dark:ring-slate-900 bg-gradient-to-tr from-blue-500 to-purple-500 overflow-hidden shadow-xl flex items-center justify-center text-white text-3xl font-bold">
                      {profilePicture ? (
                        <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        initials
                      )}
                    </div>
                    {/* Hover overlay for avatar */}
                    <div
                      className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer backdrop-blur-sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Camera className="text-white w-8 h-8" />
                    </div>
                  </div>

                  <div className="flex-1 space-y-3 pb-2">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/png, image/jpeg, image/jpg, image/webp"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400 transition-all shadow-sm"
                      >
                        <Upload size={16} />
                        Upload new photo
                      </button>
                      {profilePicture !== user?.profile_picture && (
                        <button
                          type="button"
                          onClick={() => {
                            setProfilePicture(user?.profile_picture || "");
                            if (fileInputRef.current) fileInputRef.current.value = "";
                          }}
                          className="text-sm font-medium text-red-500 hover:text-red-600 transition-colors px-2 mt-2 sm:mt-0"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 flex flex-wrap items-center gap-1.5 break-words">
                      <span className="font-semibold text-gray-700 dark:text-gray-300 px-2 py-0.5 bg-gray-100 dark:bg-slate-800 rounded-md">Max size: 1MB</span>
                      Supported: JPG, PNG, WEBP.
                    </p>
                  </div>
                </div>

                {/* Messages */}
                {profileError && (
                  <div className="mb-6 p-4 bg-red-50/80 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-400 rounded-xl text-sm flex items-start gap-3 backdrop-blur-sm shadow-sm">
                    <Shield className="w-5 h-5 shrink-0 mt-0.5" />
                    <div>{profileError}</div>
                  </div>
                )}
                {profileSuccess && (
                  <div className="mb-6 p-4 bg-green-50/80 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 text-green-700 dark:text-green-400 rounded-xl text-sm flex items-start gap-3 backdrop-blur-sm shadow-sm">
                    <Shield className="w-5 h-5 shrink-0 mt-0.5" />
                    <div>{profileSuccess}</div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {/* Full name */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Full Name
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-blue-500">
                        <User className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500" />
                      </div>
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="block w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50 pl-11 py-3 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 dark:focus:border-blue-500 dark:text-white transition-all outline-none hover:bg-white dark:hover:bg-slate-800"
                        required
                        placeholder="John Doe"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Email Address
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-blue-500">
                        <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500" />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="block w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50 pl-11 py-3 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 dark:focus:border-blue-500 dark:text-white transition-all outline-none hover:bg-white dark:hover:bg-slate-800"
                        required
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>
                </div>

                {/* Current Password for Profile Updates */}
                {((name !== user?.name) || (email !== user?.email)) && (
                  <div className="mb-8 p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 border border-amber-200/60 dark:border-amber-700/30 shadow-inner">
                    <label className="block text-sm font-bold text-amber-900 dark:text-amber-500 mb-2 flex items-center gap-2">
                      <Lock className="w-5 h-5" />
                      Authentication Required
                    </label>
                    <p className="text-sm text-amber-700/90 dark:text-amber-500/80 mb-5 leading-relaxed">
                      You are changing sensitive profile information. Please enter your current password to confirm these changes securely.
                    </p>
                    <div className="relative max-w-md group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <KeyRound className="h-5 w-5 text-amber-600/50 group-focus-within:text-amber-600 dark:text-amber-500/50 dark:group-focus-within:text-amber-500 transition-colors" />
                      </div>
                      <input
                        type="password"
                        value={profileCurrentPassword}
                        onChange={(e) => setProfileCurrentPassword(e.target.value)}
                        className="block w-full rounded-xl border border-amber-200 dark:border-amber-700/50 bg-white/80 dark:bg-slate-900/80 pl-11 py-3 text-sm focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 dark:text-white transition-all outline-none shadow-sm"
                        placeholder="Enter current password"
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="pt-6 border-t border-gray-100 dark:border-slate-800 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="inline-flex flex-row items-center justify-center gap-2 min-w-[150px] bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:from-blue-700 hover:to-indigo-700 focus:ring-4 focus:ring-blue-500/20 transition-all shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSavingProfile ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Saving...
                      </div>
                    ) : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </section>

          {/* SECURITY SECTION */}
          <section className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-gray-200/60 dark:border-slate-800 overflow-hidden transition-all hover:shadow-md mb-12">
            <div className="px-6 sm:px-10 py-6 sm:py-8 border-b border-gray-100 dark:border-slate-800 flex items-center gap-4 bg-gray-50/30 dark:bg-slate-800/20">
              <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl text-indigo-600 dark:text-indigo-400 shadow-sm">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                  Password & Security
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Update your password to keep your account secure.
                </p>
              </div>
            </div>

            <form onSubmit={handleSecuritySubmit} className="px-6 sm:px-10 py-8">
              <div className="max-w-xl space-y-6">
                {secError && (
                  <div className="p-4 bg-red-50/80 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-400 rounded-xl text-sm flex items-start gap-3 backdrop-blur-sm shadow-sm">
                    <Shield className="w-5 h-5 shrink-0 mt-0.5" />
                    <div>{secError}</div>
                  </div>
                )}
                {secSuccess && (
                  <div className="p-4 bg-green-50/80 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 text-green-700 dark:text-green-400 rounded-xl text-sm flex items-start gap-3 backdrop-blur-sm shadow-sm">
                    <Shield className="w-5 h-5 shrink-0 mt-0.5" />
                    <div>{secSuccess}</div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Current Password</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-indigo-500">
                      <KeyRound className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500" />
                    </div>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={secCurrentPassword}
                      onChange={(e) => setSecCurrentPassword(e.target.value)}
                      className="block w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50 pl-11 py-3 text-sm focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 dark:focus:border-indigo-500 dark:text-white transition-all outline-none hover:bg-white dark:hover:bg-slate-800"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-5 pt-2">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      New Password
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-indigo-500">
                        <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500" />
                      </div>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={secNewPassword}
                        onChange={(e) => setSecNewPassword(e.target.value)}
                        className="block w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50 pl-11 py-3 text-sm focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 dark:focus:border-indigo-500 dark:text-white transition-all outline-none hover:bg-white dark:hover:bg-slate-800"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Confirm New Password</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-indigo-500">
                        <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500" />
                      </div>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={secConfirmPassword}
                        onChange={(e) => setSecConfirmPassword(e.target.value)}
                        className="block w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50 pl-11 py-3 text-sm focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 dark:focus:border-indigo-500 dark:text-white transition-all outline-none hover:bg-white dark:hover:bg-slate-800"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    type="submit"
                    disabled={isSavingSecurity}
                    className="w-full sm:w-auto inline-flex flex-row items-center justify-center gap-2 min-w-[200px] bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-6 py-3.5 rounded-xl text-sm font-semibold hover:bg-slate-800 dark:hover:bg-white focus:ring-4 focus:ring-slate-500/20 transition-all shadow-md shadow-slate-900/10 hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSavingSecurity ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        Updating Password...
                      </div>
                    ) : (
                      <>
                        <Shield className="w-4 h-4" />
                        Update Password
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </section>

        </div>
      </div>
    </div>
  );
}
