import { Users, CheckCircle, Percent } from "lucide-react";

/* ================= TYPES ================= */

type LeadsKpiProps = {
  total: number;
  qualified: number;
  conversion: number;
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
  value: string | number;
  vertical?: boolean;
}) {
  return (
    <div
      className={`
        bg-white border rounded-2xl
        p-4
        flex
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

function DesktopLeadsKpi({
  total,
  qualified,
  conversion,
}: LeadsKpiProps) {
  return (
    <div className="hidden md:grid grid-cols-3 gap-6">
      <KpiCard
        icon={<Users size={18} />}
        label="Total Leads"
        value={total}
      />
      <KpiCard
        icon={<CheckCircle size={18} />}
        label="Qualified Leads"
        value={qualified}
      />
      <KpiCard
        icon={<Percent size={18} />}
        label="Conversion Rate"
        value={`${conversion}%`}
      />
    </div>
  );
}

/* ================= MOBILE KPI ROW ================= */

function MobileLeadsKpi({
  total,
  qualified,
  conversion,
}: LeadsKpiProps) {
  return (
    <div className="md:hidden grid grid-cols-3 gap-3">
      <KpiCard
        icon={<Users size={16} />}
        label="Total"
        value={total}
        vertical
      />
      <KpiCard
        icon={<CheckCircle size={16} />}
        label="Qualified"
        value={qualified}
        vertical
      />
      <KpiCard
        icon={<Percent size={16} />}
        label="Conversion"
        value={`${conversion}%`}
        vertical
      />
    </div>
  );
}

/* ================= MAIN EXPORT ================= */

export function LeadsKpi({
  total,
  qualified,
  conversion,
}: LeadsKpiProps) {
  return (
    <>
      <DesktopLeadsKpi
        total={total}
        qualified={qualified}
        conversion={conversion}
      />
      <MobileLeadsKpi
        total={total}
        qualified={qualified}
        conversion={conversion}
      />
    </>
  );
}
