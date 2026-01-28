import { useState } from "react";
import {
  Mail,
  Phone,
  MessageSquare,
  Search,
  Users,
  CheckCircle,
  Percent,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { UI } from "@/ui/colors";

/* ================= TYPES ================= */

type LeadStatus = "Qualified" | "Unqualified";

interface Lead {
  conversation_id: string;
  name: string;
  email: string;
  phone: string;
  business_description: string;
  status: LeadStatus;
}

/* ================= DUMMY DATA ================= */

const DUMMY_LEADS: Lead[] = [
  {
    conversation_id: "conv_001",
    name: "Kumar Patil",
    email: "kumar@gmail.com",
    phone: "+91 9876543210",
    business_description:
      "Managing school students and academic administration services.",
    status: "Qualified",
  },
  {
    conversation_id: "conv_002",
    name: "Ayesha Khan",
    email: "ayesha@startup.io",
    phone: "+91 9123456789",
    business_description:
      "Running a digital marketing agency focused on local businesses.",
    status: "Qualified",
  },
  {
    conversation_id: "conv_003",
    name: "Rahul Deshmukh",
    email: "rahul@realestate.com",
    phone: "-",
    business_description:
      "Real estate consulting for residential and commercial properties.",
    status: "Unqualified",
  },
];

/* ================= HELPERS ================= */

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

function statusStyles(status: LeadStatus) {
  return status === "Qualified"
    ? "bg-green-100 text-green-700"
    : "bg-yellow-100 text-yellow-700";
}

/* ================= PAGE ================= */

export function LeadsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const filteredLeads = DUMMY_LEADS.filter(
    (l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.email.toLowerCase().includes(search.toLowerCase())
  );

  const totalLeads = DUMMY_LEADS.length;
  const qualifiedLeads = DUMMY_LEADS.filter(
    (l) => l.status === "Qualified"
  ).length;

  const conversionRate =
    totalLeads === 0
      ? 0
      : Math.round((qualifiedLeads / totalLeads) * 100);

  return (
    <div className="space-y-8">
      {/* ================= HEADER ================= */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Leads
          </h1>
          <p
            className="mt-1 text-base"
            style={{ color: UI.colors.text.muted }}
          >
            Captured automatically by your AI avatar
          </p>
        </div>

        <div
          className="flex items-center gap-2 px-3 py-2 rounded-xl"
          style={{
            background: UI.colors.surface.glassSm,
            border: `1px solid ${UI.colors.border.glass}`,
          }}
        >
          <Search size={16} />
          <input
            placeholder="Search leads..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent outline-none text-sm"
          />
        </div>
      </div>

      {/* ================= KPI CARDS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          icon={<Users size={18} />}
          label="Total Leads"
          value={totalLeads}
        />
        <StatCard
          icon={<CheckCircle size={18} />}
          label="Qualified Leads"
          value={qualifiedLeads}
        />
        <StatCard
          icon={<Percent size={18} />}
          label="Conversion Rate"
          value={`${conversionRate}%`}
        />
      </div>

      {/* ================= TABLE HEADER ================= */}
      <div
        className="grid grid-cols-12 px-5 py-3 text-xs font-semibold uppercase tracking-wide"
        style={{ color: UI.colors.text.muted }}
      >
        <div className="col-span-3">Lead</div>
        <div className="col-span-3">Email</div>
        <div className="col-span-2">Phone</div>
        <div className="col-span-2">Status</div>
        <div className="col-span-1 text-right">Chat</div>
      </div>

      {/* ================= LEADS LIST ================= */}
      {filteredLeads.length === 0 ? (
        <div className="text-center py-16 text-sm text-gray-500">
          🤖 Your AI hasn’t captured any leads yet
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLeads.map((lead) => (
            <div
              key={lead.conversation_id}
              onClick={() =>
                navigate(
                  `/dashboard/conversations/${lead.conversation_id}`
                )
              }
              className="grid grid-cols-12 items-center px-5 py-4 rounded-2xl cursor-pointer transition-all hover:-translate-y-[1px]"
              style={{
                background: UI.colors.surface.glassSm,
                boxShadow:
                  "inset 0 0 0 1px rgba(0,0,0,0.05), 0 10px 24px rgba(0,0,0,0.06)",
              }}
            >
              {/* NAME */}
              <div className="col-span-3 flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{
                    background: UI.colors.primary + "20",
                    color: UI.colors.primary,
                  }}
                >
                  {getInitials(lead.name)}
                </div>
                <span className="font-semibold">
                  {lead.name}
                </span>
              </div>

              {/* EMAIL */}
              <div className="col-span-3 flex items-center gap-2 text-sm">
                <Mail size={14} className="opacity-60" />
                {lead.email}
              </div>

              {/* PHONE */}
              <div className="col-span-2 flex items-center gap-2 text-sm">
                <Phone size={14} className="opacity-60" />
                {lead.phone}
              </div>

              {/* STATUS */}
              <div className="col-span-2">
                <span
                  className={`text-xs px-3 py-1 rounded-full font-medium ${statusStyles(
                    lead.status
                  )}`}
                >
                  {lead.status}
                </span>
              </div>

              {/* ACTION */}
              <div className="col-span-1 flex justify-end">
                <div
                  className="p-2 rounded-full"
                  style={{
                    background: UI.colors.primary + "15",
                    color: UI.colors.primary,
                  }}
                >
                  <MessageSquare size={16} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ================= STAT CARD ================= */

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div
      className="rounded-2xl px-5 py-4 flex items-center gap-4"
      style={{
        background: UI.colors.surface.glassSm,
        border: `1px solid ${UI.colors.border.glass}`,
      }}
    >
      <div
        className="p-3 rounded-xl"
        style={{
          background: UI.colors.primary + "15",
          color: UI.colors.primary,
        }}
      >
        {icon}
      </div>
      <div>
        <p className="text-xs uppercase tracking-wide text-gray-500">
          {label}
        </p>
        <p className="text-xl font-semibold">{value}</p>
      </div>
    </div>
  );
}
