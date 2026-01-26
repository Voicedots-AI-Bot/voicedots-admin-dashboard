import { useState } from "react";

export default function SettingsPage() {
  const [name, setName] = useState("Sai Kumar");

  return (
    <div className="w-full px-4 sm:px-8 py-4 sm:py-6">
      {/* Page title */}
      <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-white mb-6 sm:mb-8">
        Settings
      </h1>

      <div className="max-w-full">
        {/* PROFILE */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl shadow border border-gray-200 dark:border-slate-700 mb-6 sm:mb-8">
          <div className="px-4 sm:px-8 py-4 sm:py-6 border-b border-gray-200 dark:border-slate-700">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
              Profile
            </h2>
          </div>

          <div className="px-4 sm:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
            {/* Avatar row */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
              <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-lg sm:text-xl font-semibold">
                SK
              </div>

              <button className="w-full sm:w-auto px-5 py-2.5 rounded-lg border border-gray-300 text-sm font-medium hover:bg-gray-50 dark:border-slate-700 dark:hover:bg-slate-800">
                Change photo
              </button>
            </div>

            {/* Full name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Full name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full sm:max-w-xl rounded-lg border border-gray-300 px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <input
                disabled
                value="saikumar@example.com"
                className="w-full sm:max-w-xl rounded-lg border border-gray-300 px-4 py-3 text-sm bg-gray-50 text-gray-500 dark:bg-slate-800 dark:border-slate-700"
              />
            </div>

            <button className="w-full sm:w-auto mt-2 bg-blue-600 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-blue-700">
              Save changes
            </button>
          </div>
        </section>

        {/* SECURITY */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl shadow border border-gray-200 dark:border-slate-700">
          <div className="px-4 sm:px-8 py-4 sm:py-6 border-b border-gray-200 dark:border-slate-700">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
              Security
            </h2>
          </div>

          <div className="px-4 sm:px-8 py-6 sm:py-8 space-y-4 sm:space-y-6 sm:max-w-xl">
            <input
              type="password"
              placeholder="Current password"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm dark:bg-slate-800 dark:border-slate-700"
            />
            <input
              type="password"
              placeholder="New password"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm dark:bg-slate-800 dark:border-slate-700"
            />
            <input
              type="password"
              placeholder="Confirm new password"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm dark:bg-slate-800 dark:border-slate-700"
            />

            <button className="w-full sm:w-auto bg-blue-600 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-blue-700">
              Update password
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
