import { useState } from "react";
import {
  X,
  Phone,
  Mail,
  MessageCircle,
} from "lucide-react";
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
        fixed right-0 bottom-0
        bg-white border-l shadow-2xl z-50
        flex flex-col
        w-full sm:w-[420px]
      "
      style={{
        top: `${TOPBAR_HEIGHT}px`,
        height: `calc(100vh - ${TOPBAR_HEIGHT}px)`,
      }}
    >
      {/* ================= STICKY HEADER ================= */}
      <div className="sticky top-0 z-10 bg-white border-b px-5 py-4 flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold">
            {getInitials(lead.name)}
          </div>
          <div>
            <p className="font-semibold leading-tight">{lead.name}</p>
            <p className="text-xs text-gray-500">{lead.email}</p>
          </div>
        </div>

        <button onClick={onClose} className="p-1">
          <X size={18} />
        </button>
      </div>

      {/* ================= STICKY STATUS ================= */}
      <div className="sticky top-[73px] z-10 bg-white border-b px-5 py-3">
        <select
          value={lead.status}
          className="w-full border rounded-lg px-3 py-2 text-sm"
        >
          <option value="Qualified">Qualified</option>
          <option value="Unqualified">Unqualified</option>
          <option value="Follow Up">Follow Up</option>
        </select>
      </div>

      {/* ================= STICKY ACTIONS ================= */}
      <div className="sticky top-[130px] z-10 bg-white border-b px-5 py-4 grid grid-cols-3 gap-3">
        <Action icon={<Phone size={16} />} label="Call" disabled />
        <Action icon={<Mail size={16} />} label="Email" />
        <Action icon={<MessageCircle size={16} />} label="WhatsApp" />
      </div>

      {/* ================= STICKY TABS ================= */}
      <div className="sticky top-[200px] z-10 bg-white border-b px-5 flex gap-4">
        {[
          ["details", "Details"],
          ["notes", "Notes"],
          ["activity", "Activity"],
          ["next", "Next Call"],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key as any)}
            className={`py-3 text-sm ${
              tab === key
                ? "border-b-2 border-black font-semibold"
                : "text-gray-500"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ================= SCROLLABLE CONTENT ================= */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5 text-sm">
        {tab === "details" && (
          <>
            <InfoRow label="Phone" value={lead.phone} />
            <InfoRow label="Email" value={lead.email} />

            <div>
              <p className="text-gray-500 mb-1">Business Description</p>
              <p className="text-gray-700 leading-relaxed">
                {lead.business_description}
              </p>
            </div>
          </>
        )}

        {tab === "notes" && (
          <textarea
            placeholder="Add internal notes..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full h-40 border rounded-lg p-3 text-sm resize-none"
          />
        )}

        {tab === "activity" && (
          <ul className="space-y-3 text-gray-600">
            <li>• AI conversation completed</li>
            <li>• Lead status: {lead.status}</li>
          </ul>
        )}

        {tab === "next" && (
          <div>
            <label className="text-gray-500 block mb-1">
              Schedule next call
            </label>
            <input
              type="datetime-local"
              className="border rounded-lg px-3 py-2 w-full text-sm"
            />
          </div>
        )}
      </div>

      {/* ================= STICKY FOOTER ================= */}
      <div className="border-t px-5 py-4 bg-white">
        <p className="text-xs text-gray-500 mb-2">Next Suggested Action</p>

        <div className="flex gap-3">
          <button className="flex-1 border rounded-lg py-2 text-sm">
            Schedule Call
          </button>
          <button className="flex-1 border rounded-lg py-2 text-sm">
            Send WhatsApp
          </button>
        </div>

        <div className="mt-3 text-xs text-gray-500">
          Last AI Call:{" "}
          <span className="text-gray-700">4m 32s · {lead.status}</span>
        </div>
      </div>
    </div>
  );
}

/* ================= SUB COMPONENTS ================= */

function Action({
  icon,
  label,
  disabled,
}: {
  icon: React.ReactNode;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      disabled={disabled}
      className={`border rounded-xl py-3 flex flex-col items-center gap-1 text-sm ${
        disabled
          ? "bg-gray-100 text-gray-400"
          : "hover:bg-gray-50"
      }`}
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
      <span className="font-medium">{value}</span>
    </div>
  );
}
