import {
  PhoneCall,
  DollarSign,
  Clock,
  BarChart2,
} from "lucide-react";

/* ================= TYPES ================= */

type KpiProps = {
  totalConversations: number;
  totalCostUsd: number;
  avgCostUsd: number;
  avgCallDurationSecs: number;
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

/* ================= HELPERS ================= */

const formatUsd = (value: number) =>
  `$${value?.toFixed(2)}`;

const formatDuration = (secs: number) => {
  const min = Math.floor(secs / 60);
  const sec = secs % 60;
  return `${min}m ${sec}s`;
};

/* ================= DESKTOP KPI ROW ================= */

function DesktopKpis({
  totalConversations,
  totalCostUsd,
  avgCostUsd,
  avgCallDurationSecs,
}: KpiProps) {
  return (
    <div className="hidden md:grid grid-cols-4 gap-6">
      <KpiCard
        icon={<PhoneCall size={18} />}
        label="Total Conversations"
        value={totalConversations}
      />
      <KpiCard
        icon={<DollarSign size={18} />}
        label="Total Cost"
        value={formatUsd(totalCostUsd)}
      />
      <KpiCard
        icon={<BarChart2 size={18} />}
        label="Avg Cost / Call"
        value={formatUsd(avgCostUsd)}
      />
      <KpiCard
        icon={<Clock size={18} />}
        label="Avg Call Duration"
        value={formatDuration(avgCallDurationSecs)}
      />
    </div>
  );
}

/* ================= MOBILE KPI ROW ================= */

function MobileKpis({
  totalConversations,
  totalCostUsd,
  avgCostUsd,
  avgCallDurationSecs,
}: KpiProps) {
  return (
    <div className="md:hidden grid grid-cols-2 gap-3">
      <KpiCard
        icon={<PhoneCall size={16} />}
        label="Calls"
        value={totalConversations}
        vertical
      />
      <KpiCard
        icon={<DollarSign size={16} />}
        label="Total Cost"
        value={formatUsd(totalCostUsd)}
        vertical
      />
      <KpiCard
        icon={<BarChart2 size={16} />}
        label="Avg Cost"
        value={formatUsd(avgCostUsd)}
        vertical
      />
      <KpiCard
        icon={<Clock size={16} />}
        label="Avg Duration"
        value={formatDuration(avgCallDurationSecs)}
        vertical
      />
    </div>
  );
}

/* ================= MAIN EXPORT ================= */

export function LeadsKpi({
  totalConversations,
  totalCostUsd,
  avgCostUsd,
  avgCallDurationSecs,
}: KpiProps) {
  return (
    <>
      <DesktopKpis
        totalConversations={totalConversations}
        totalCostUsd={totalCostUsd}
        avgCostUsd={avgCostUsd}
        avgCallDurationSecs={avgCallDurationSecs}
      />
      <MobileKpis
        totalConversations={totalConversations}
        totalCostUsd={totalCostUsd}
        avgCostUsd={avgCostUsd}
        avgCallDurationSecs={avgCallDurationSecs}
      />
    </>
  );
}
