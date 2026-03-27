import { useEffect, useState } from "react";
import {
  Phone,
  MessageSquare,
  Search,
  Loader2,
} from "lucide-react";
import leadsApi from "@/api/leads";
import { LeadDetailsDrawer } from "@/components/LeadDetailsDrawer";
import { LeadsKpi } from "@/components/leadsKpi";
import type { Lead } from "@/types/lead.types";

const DRAWER_WIDTH = 420;

export function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [selectedLead, setSelectedLead] =
    useState<Lead | null>(null);
  const [drawerOpen, setDrawerOpen] =
    useState(false);

  /* ================= FETCH LEADS ================= */

  useEffect(() => {
    async function fetchLeads() {
      setLoading(true);
      const data = await leadsApi.getLeads();
      setLeads(data);
      setLoading(false);
    }

    fetchLeads();
  }, []);

  /* ================= DERIVED DATA ================= */

  const filteredLeads = leads.filter(
    (l) =>
      (l.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (l.email ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const totalLeads = leads.length;

  const qualifiedLeads = leads.filter(
    (l) => l.status === "Qualified"
  ).length;

  /* ================= RENDER ================= */

  return (
    <>
      {/* ================= MAIN CONTENT ================= */}
      <div
        className="flex flex-col h-full overflow-hidden gap-6 transition-all duration-300"
        style={{
          marginRight: drawerOpen
            ? `${DRAWER_WIDTH}px`
            : "0px",
        }}
      >
        {/* ================= HEADER ================= */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">
              Leads
            </h1>
            <p className="text-gray-500">
              Captured automatically by your AI avatar
            </p>
          </div>

          {/* SEARCH */}
          <div className="relative w-full md:w-[280px]">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              placeholder="Search leads"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="
                w-full h-11
                pl-10 pr-3
                rounded-xl
                border
                bg-white
                text-sm
                outline-none
                focus:ring-2 focus:ring-black/10
              "
            />
          </div>
        </div>

        {/* ================= KPI SECTION ================= */}
        {!loading && (
          <LeadsKpi
            totalLeads={totalLeads}
            qualifiedLeads={qualifiedLeads}
          />
        )}

        {/* ================= LEADS LIST ================= */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-gray-400" />
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="text-center py-20 text-gray-500 text-sm">
              No leads found
            </div>
          ) : (
            filteredLeads.map((lead) => (
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
                "
              >
                {/* LEFT */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold shrink-0">
                    {(lead.name ?? "?")
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>

                  <div className="min-w-0">
                    <p className="font-medium truncate">
                      {lead.name ?? "Unknown"}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {lead.email ?? "—"}
                    </p>
                  </div>
                </div>

                {/* PHONE — DESKTOP */}
                <div className="hidden lg:flex items-center gap-2 text-sm text-gray-600 w-[180px]">
                  <Phone size={14} />
                  {lead.mobile}
                </div>

                {/* STATUS */}
                <span
                  className={`text-xs px-3 py-1 rounded-full font-medium shrink-0 ${
                    lead.status === "Qualified"
                      ? "bg-green-50 text-green-700"
                      : "bg-yellow-50 text-yellow-700"
                  }`}
                >
                  {lead.status}
                </span>

                {/* ACTION */}
                <div className="w-9 h-9 rounded-full border flex items-center justify-center text-gray-500 shrink-0">
                  <MessageSquare size={16} />
                </div>
              </div>
            ))
          )}
        </div>
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
