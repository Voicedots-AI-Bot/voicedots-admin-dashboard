import { useEffect, useState } from "react";
import {
  Phone,
  Search,
  Loader2,
  Download,
  Trash2,
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
      try {
        const data = await leadsApi.getLeads();
        setLeads(data);
      } catch (err) {
        console.error("Failed to fetch leads", err);
      } finally {
        setLoading(false);
      }
    }

    fetchLeads();
  }, []);

  /* ================= HANDLERS ================= */

  async function handleDeleteLead(
    e: React.MouseEvent,
    conversationId: string
  ) {
    e.stopPropagation();
    if (
      !window.confirm(
        "Are you sure you want to delete this lead?"
      )
    )
      return;

    try {
      await leadsApi.deleteLead(conversationId);
      setLeads((prev) =>
        prev.filter(
          (l) => l.conversation_id !== conversationId
        )
      );
      if (
        selectedLead?.conversation_id === conversationId
      ) {
        setDrawerOpen(false);
        setSelectedLead(null);
      }
    } catch (err) {
      console.error("Delete failed", err);
    }
  }

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

  /* ================= HANDLERS ================= */

  const handleDownloadExcel = () => {
    if (leads.length === 0) return;

    const escapeCsv = (str: string | undefined | null) => {
      if (!str) return '""';
      const escaped = String(str).replace(/"/g, '""');
      return `"${escaped}"`;
    };

    const headers = ["Name", "Phone", "Email", "Description"];
    const csvContent = [
      headers.join(","),
      ...leads.map((lead) => {
        const name = escapeCsv(lead.name);
        const phone = escapeCsv((lead as any).mobile || lead.mobile);
        const email = escapeCsv(lead.email);
        const desc = escapeCsv(lead.business_description);
        return [name, phone, email, desc].join(",");
      })
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "leads_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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

          {/* ACTIONS */}
          <div className="flex items-center gap-3">
            {/* SEARCH */}
            <div className="relative w-full md:w-[280px]">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                placeholder="Search leads"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
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

            {/* DOWNLOAD EXPORT */}
            <button
              onClick={handleDownloadExcel}
              disabled={leads.length === 0}
              className="
                flex items-center gap-2 h-11 px-4
                bg-black text-white
                rounded-xl text-sm font-medium
                hover:bg-gray-800 transition
                disabled:opacity-50 disabled:cursor-not-allowed
                shrink-0
              "
            >
              <Download size={16} />
              <span className="hidden sm:inline">Export</span>
            </button>
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
            <div className="flex justify-center items-center py-20">
              <Loader2 className="animate-spin text-gray-400" />
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="flex justify-center items-center py-20 text-gray-500 text-sm">
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
                flex items-center
                bg-white border rounded-xl
                px-4 py-3
                cursor-pointer transition hover:bg-gray-50
                gap-4
              "
              >
                {/* LEFT (flex-grow) */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
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

                {/* PHONE */}
                <div className="hidden lg:flex items-center gap-2 text-sm text-gray-600 w-[180px] shrink-0 justify-start">
                  <Phone size={14} />
                  <span className="truncate">{lead.mobile ?? "—"}</span>
                </div>

                {/* STATUS (fixed width center aligned) */}
                <div className="w-[130px] flex justify-center shrink-0">
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-medium ${lead.status === "Qualified"
                      ? "bg-green-50 text-green-700"
                      : lead.status === "Unqualified"
                        ? "bg-yellow-50 text-yellow-700"
                        : "bg-blue-50 text-blue-700"
                      }`}
                  >
                    {lead.status}
                  </span>
                </div>

                {/* ACTION */}
                <div className="w-10 flex justify-end shrink-0 gap-2">
                  <button
                    onClick={(e) =>
                      handleDeleteLead(e, lead.conversation_id)
                    }
                    className="w-9 h-9 rounded-full border flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 hover:border-red-100 transition-all duration-200"
                  >
                    <Trash2 size={16} />
                  </button>
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
        onUpdateLead={(updatedLead) => {
          setLeads((prevLeads) =>
            prevLeads.map((l) =>
              l.conversation_id === updatedLead.conversation_id ? updatedLead : l
            )
          );
          setSelectedLead(updatedLead);
        }}
        onDeleteLead={(conversationId) => {
          setLeads((prev) =>
            prev.filter((l) => l.conversation_id !== conversationId)
          );
          setDrawerOpen(false);
          setSelectedLead(null);
        }}
      />
    </>
  );
}
