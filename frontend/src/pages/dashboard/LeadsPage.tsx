import { useEffect, useState } from "react";
import {
  Mail,
  Phone,
  MessageSquare,
  Search,
  Users,
  CheckCircle,
  Percent,
  Loader2,
} from "lucide-react";
import leadsApi from "@/api/leads";
import { LeadDetailsDrawer } from "@/components/LeadDetailsDrawer";
import type { Lead } from "@/types/lead.types";

export function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    async function fetchLeads() {
      setLoading(true);
      const data = await leadsApi.getLeads();
      setLeads(data);
      setLoading(false);
    }
    fetchLeads();
  }, []);

  const filteredLeads = leads.filter(
    (l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.email.toLowerCase().includes(search.toLowerCase())
  );

  const qualifiedCount = leads.filter(
    (l) => l.status === "Qualified"
  ).length;

  const conversionRate =
    leads.length === 0
      ? 0
      : Math.round((qualifiedCount / leads.length) * 100);

  return (
    <>
      {/* ================= MAIN CONTENT (PUSHES LEFT) ================= */}
      <div
        className="space-y-8 transition-all duration-300"
        style={{ marginRight: drawerOpen ? "420px" : "0px" }}
      >
        {/* HEADER */}
        <div className="flex justify-between items-start gap-6">
          <div>
            <h1 className="text-3xl font-bold">Leads</h1>
            <p className="text-gray-500">
              Captured automatically by your AI avatar
            </p>
          </div>

          {/* SEARCH */}
          <div className="flex items-center gap-3 px-4 h-11 rounded-xl border bg-white shadow-sm">
            <Search size={18} className="text-gray-500" />
            <input
              placeholder="Search leads"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="outline-none bg-transparent text-sm w-48"
            />
          </div>
        </div>

        {/* KPI CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <KpiCard
            label="Total Leads"
            value={leads.length}
            icon={<Users size={18} />}
          />
          <KpiCard
            label="Qualified Leads"
            value={qualifiedCount}
            icon={<CheckCircle size={18} />}
          />
          <KpiCard
            label="Conversion Rate"
            value={`${conversionRate}%`}
            icon={<Percent size={18} />}
          />
        </div>

        {/* LEADS LIST */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin" />
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="text-center py-20 text-gray-500 text-sm">
            No leads found
          </div>
        ) : (
          <div className="space-y-2">
            {filteredLeads.map((lead) => (
              <div
                key={lead.conversation_id}
                onClick={() => {
                  setSelectedLead(lead);
                  setDrawerOpen(true);
                }}
                className="
                  flex items-center justify-between
                  bg-white border rounded-xl
                  px-4 py-3
                  cursor-pointer
                  transition
                  hover:bg-gray-50
                  hover:shadow-sm
                "
              >
                {/* LEFT: AVATAR + NAME */}
                <div className="flex items-center gap-3 min-w-[260px]">
                  <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold">
                    {lead.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>

                  <div className="leading-tight">
                    <p className="font-medium">{lead.name}</p>
                    <p className="text-xs text-gray-500 truncate max-w-[180px]">
                      {lead.email}
                    </p>
                  </div>
                </div>

                {/* PHONE */}
                <div className="hidden md:flex items-center gap-2 text-sm text-gray-600 w-[180px]">
                  <Phone size={14} />
                  <span className="whitespace-nowrap">
                    {lead.phone}
                  </span>
                </div>

                {/* STATUS */}
                <span
                  className={`text-xs px-3 py-1 rounded-full font-medium ${
                    lead.status === "Qualified"
                      ? "bg-green-50 text-green-700"
                      : "bg-yellow-50 text-yellow-700"
                  }`}
                >
                  {lead.status}
                </span>

                {/* ACTION */}
                <div className="w-9 h-9 rounded-full border flex items-center justify-center text-gray-500">
                  <MessageSquare size={16} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ================= DRAWER ================= */}
      <LeadDetailsDrawer
        lead={selectedLead}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </>
  );
}

/* ================= KPI CARD ================= */

function KpiCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white border rounded-2xl p-4 flex items-center gap-4 shadow-sm">
      <div className="p-3 rounded-xl bg-gray-100">
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-xl font-semibold">{value}</p>
      </div>
    </div>
  );
}
