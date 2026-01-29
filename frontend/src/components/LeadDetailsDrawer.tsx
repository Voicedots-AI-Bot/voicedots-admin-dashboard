import { useState } from "react";
import { X, Phone, Mail, MessageSquare } from "lucide-react";
import type { Lead } from "@/types/lead.types";

const TOPBAR_HEIGHT = 64;

/* ================= HELPERS ================= */

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

/* ================= COMPONENT ================= */

export function LeadDetailsDrawer({
  lead,
  isOpen,
  onClose,
}: {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<
    "details" | "notes" | "activity" | "next"
  >("details");

  const [notes, setNotes] = useState("");

  if (!isOpen || !lead) return null;

  return (
    <div
      className="
        fixed right-0
        w-[420px]
        bg-white
        border-l
        shadow-2xl
        z-50
        flex flex-col
      "
      style={{
        top: `${TOPBAR_HEIGHT}px`,
        height: `calc(100vh - ${TOPBAR_HEIGHT}px)`,
      }}
    >
      {/* ================= HEADER WITH AVATAR ================= */}
      <div className="px-6 py-5 border-b flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center font-semibold text-sm">
            {getInitials(lead.name)}
          </div>

          {/* Name & Email */}
          <div>
            <h2 className="font-semibold text-lg leading-tight">
              {lead.name}
            </h2>
            <p className="text-sm text-gray-500">
              {lead.email}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-gray-100"
        >
          <X size={18} />
        </button>
      </div>

      {/* ================= STATUS ================= */}
      <div className="px-6 py-3 border-b">
        <select
          defaultValue={lead.status}
          className="
            border rounded-lg
            px-3 py-1.5
            text-sm
            outline-none
            focus:ring-2 focus:ring-black/10
          "
        >
          <option>Qualified</option>
          <option>Unqualified</option>
          <option>Follow Up</option>
        </select>
      </div>

      {/* ================= ACTIONS ================= */}
      <div className="px-6 py-4 grid grid-cols-3 gap-3 border-b">
        <Action icon={<Phone size={16} />} label="Call" />
        <Action icon={<Mail size={16} />} label="Email" />
        <Action icon={<MessageSquare size={16} />} label="Chat" />
      </div>

      {/* ================= TABS ================= */}
      <div className="flex px-6 border-b">
        {[
          ["details", "Details"],
          ["notes", "Notes"],
          ["activity", "Activity"],
          ["next", "Next Call"],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key as any)}
            className={`
              py-3 px-3 text-sm transition
              ${
                tab === key
                  ? "border-b-2 border-black font-semibold text-black"
                  : "text-gray-500 hover:text-black"
              }
            `}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ================= CONTENT ================= */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5 text-sm">
        {tab === "details" && (
          <>
            <InfoRow label="Phone" value={lead.phone} />
            <InfoRow label="Email" value={lead.email} />

            <div>
              <p className="text-gray-500 mb-1">
                Business Description
              </p>
              <p className="text-gray-700 leading-relaxed">
                {lead.business_description}
              </p>
            </div>
          </>
        )}

        {tab === "notes" && (
          <textarea
            placeholder="Add internal notes for this lead..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="
              w-full h-40
              border rounded-lg
              p-3 text-sm
              outline-none
              resize-none
              focus:ring-2 focus:ring-black/10
            "
          />
        )}

        {tab === "activity" && (
          <ul className="space-y-3 text-gray-600">
            <li> Call attempted — Today 3:10 PM</li>
            <li> AI conversation completed</li>
            <li> Lead marked Qualified</li>
          </ul>
        )}

        {tab === "next" && (
          <div>
            <label className="text-gray-500 block mb-1">
              Schedule next call
            </label>
            <input
              type="datetime-local"
              className="
                border rounded-lg
                px-3 py-2
                text-sm w-full
                outline-none
                focus:ring-2 focus:ring-black/10
              "
            />
          </div>
        )}
      </div>

      {/* ================= BOTTOM CTA ================= */}
      <div className="border-t px-6 py-4 bg-white">
        <p className="text-xs text-gray-500 mb-2">
          Next Suggested Action
        </p>

        <div className="flex gap-3">
          <button className="flex-1 border rounded-lg py-2 text-sm hover:bg-gray-50">
            Schedule Call
          </button>
          <button className="flex-1 border rounded-lg py-2 text-sm hover:bg-gray-50">
            Send Email
          </button>
        </div>

        <div className="mt-3 text-xs text-gray-500">
          Last AI Call:{" "}
          <span className="text-gray-700">
            4m 32s · Qualified
          </span>
        </div>
      </div>
    </div>
  );
}

/* ================= SUB COMPONENTS ================= */

function Action({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      className="
        border rounded-xl
        py-3
        flex flex-col items-center gap-1
        text-sm
        hover:bg-gray-50
        transition
      "
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-900">
        {value}
      </span>
    </div>
  );
}
