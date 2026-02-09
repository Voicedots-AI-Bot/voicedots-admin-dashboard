import {
  Users,
  CheckCircle,
} from "lucide-react";

/* ================= TYPES ================= */

type KpiProps = {
  totalLeads: number;
  qualifiedLeads: number;
};

/* ================= SHARED KPI CARD ================= */

function KpiCard({
  icon,
  label,
  value,
  vertical = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  vertical?: boolean;
}) {
  return (
    <div
      className={`
        bg-white border rounded-2xl
        p-4 flex
        ${
          vertical
            ? "flex-col items-center text-center gap-2"
            : "flex-row items-center gap-4"
        }
      `}
    >
      <div className="p-3 rounded-xl bg-gray-100 shrink-0">
        {icon}
      </div>

      <div className="leading-tight">
        <p className="text-xs text-gray-500 whitespace-nowrap">
          {label}
        </p>
        <p className="text-xl font-semibold">
          {value}
        </p>
      </div>
    </div>
  );
}

/* ================= DESKTOP KPI ROW ================= */

function DesktopKpis({
  totalLeads,
  qualifiedLeads,
}: KpiProps) {
  return (
    <div className="hidden md:grid grid-cols-2 gap-6">
      <KpiCard
        icon={<Users size={18} />}
        label="Total Leads"
        value={totalLeads}
      />
      <KpiCard
        icon={<CheckCircle size={18} />}
        label="Qualified Leads"
        value={qualifiedLeads}
      />
    </div>
  );
}

/* ================= MOBILE KPI ROW ================= */

function MobileKpis({
  totalLeads,
  qualifiedLeads,
}: KpiProps) {
  return (
    <div className="md:hidden grid grid-cols-2 gap-3">
      <KpiCard
        icon={<Users size={16} />}
        label="Leads"
        value={totalLeads}
        vertical
      />
      <KpiCard
        icon={<CheckCircle size={16} />}
        label="Qualified"
        value={qualifiedLeads}
        vertical
      />
    </div>
  );
}

/* ================= MAIN EXPORT ================= */

export function LeadsKpi({
  totalLeads,
  qualifiedLeads,
}: KpiProps) {
  return (
    <>
      <DesktopKpis
        totalLeads={totalLeads}
        qualifiedLeads={qualifiedLeads}
      />
      <MobileKpis
        totalLeads={totalLeads}
        qualifiedLeads={qualifiedLeads}
      />
    </>
  );
}
