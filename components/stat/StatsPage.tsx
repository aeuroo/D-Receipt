"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";

import { PageHeader } from "@/components/ui/PageHeader";
import { useLocale } from "@/lib/i18n/locale-context";
import { fetchAllDocuments } from "@/lib/documents";
import { smoothTransition } from "@/lib/motion";
import { getLocalDateString } from "@/lib/document-utils";
import { isFirebaseConfigured } from "@/lib/firebase";
import type { StoredDocument } from "@/lib/types";

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
);

type DailyRange =
  | "30days"
  | "thisMonth"
  | "customMonth"
  | "thisYear"
  | "customYear";

export function StatsPage() {
  const { locale, t } = useLocale();
  const dateLocale = locale === "th" ? "th-TH" : "en-US";
  const [documents, setDocuments] = useState<StoredDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dailyRange, setDailyRange] = useState<DailyRange>("30days");
  const [customMonth, setCustomMonth] = useState("");
  const [customYear, setCustomYear] = useState("");
  const [dailyTableLimit, setDailyTableLimit] = useState(7);
  const [monthlyTableLimit, setMonthlyTableLimit] = useState(7);

  useEffect(() => {
    const now = new Date();
    setCustomMonth(getLocalDateString(now).slice(0, 7));
    setCustomYear(now.getFullYear().toString());
  }, []);

  useEffect(() => {
    (async () => {
      if (!isFirebaseConfigured()) {
        setError(t("common.firebaseMissing"));
        setLoading(false);
        return;
      }
      try {
        const data = await fetchAllDocuments();
        setDocuments(data);
      } catch (err) {
        console.error(err);
        setError(t("common.fetchError"));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const summary = useMemo(() => {
    let total = 0;
    let receipt = 0;
    let quotation = 0;
    let invoice = 0;
    let custom = 0;
    const byMonth: Record<string, { count: number; dateStr: string }> = {};
    const byYear: Record<string, number> = {};

    documents.forEach((doc) => {
      total++;
      if (doc.type === "receipt") receipt++;
      else if (doc.type === "invoice") invoice++;
      else if (doc.type === "custom") custom++;
      else quotation++;

      const date = new Date(doc.date);
      if (Number.isNaN(date.getTime())) return;

      const monthLabel = date.toLocaleDateString(dateLocale, {
        year: "numeric",
        month: "long",
      });
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      if (!byMonth[monthLabel]) {
        byMonth[monthLabel] = { count: 0, dateStr: key };
      }
      byMonth[monthLabel].count++;

      const yearKey = date.getFullYear().toString();
      byYear[yearKey] = (byYear[yearKey] || 0) + 1;
    });

    const sortedMonths = Object.entries(byMonth)
      .sort((a, b) => b[1].dateStr.localeCompare(a[1].dateStr))
      .map(([label, value]) => [label, value.count] as const);

    const sortedYears = Object.entries(byYear).sort(
      (a, b) => Number(b[0]) - Number(a[0]),
    );

    return {
      total,
      byType: { receipt, quotation, invoice, custom },
      byMonth: Object.fromEntries(sortedMonths),
      byYear: Object.fromEntries(sortedYears),
    };
  }, [documents, dateLocale]);

  const dailySeries = useMemo(() => {
    const map = new Map<
      string,
      { label: string; count: number; dateStr: string }
    >();
    const today = new Date();

    const ensure = (date: Date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const d = String(date.getDate()).padStart(2, "0");
      const dateStr = `${y}-${m}-${d}`;
      const label = date.toLocaleDateString(dateLocale, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
      if (!map.has(dateStr)) {
        map.set(dateStr, { label, count: 0, dateStr });
      }
    };

    if (dailyRange === "30days") {
      for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        ensure(d);
      }
    } else if (dailyRange === "thisMonth") {
      const y = today.getFullYear();
      const m = today.getMonth();
      const days = new Date(y, m + 1, 0).getDate();
      for (let day = 1; day <= days; day++) {
        const d = new Date(y, m, day);
        if (d > today) break;
        ensure(d);
      }
    } else if (dailyRange === "customMonth") {
      const [y, m] = customMonth.split("-");
      if (y && m) {
        const year = parseInt(y, 10);
        const month = parseInt(m, 10) - 1;
        const days = new Date(year, month + 1, 0).getDate();
        for (let day = 1; day <= days; day++) {
          ensure(new Date(year, month, day));
        }
      }
    } else if (dailyRange === "thisYear") {
      const y = today.getFullYear();
      const cursor = new Date(y, 0, 1);
      while (cursor <= today && cursor.getFullYear() === y) {
        ensure(new Date(cursor));
        cursor.setDate(cursor.getDate() + 1);
      }
    } else if (dailyRange === "customYear") {
      const y = parseInt(customYear, 10);
      if (!Number.isNaN(y)) {
        const cursor = new Date(y, 0, 1);
        const end = new Date(y, 11, 31);
        while (cursor <= end && cursor.getFullYear() === y) {
          ensure(new Date(cursor));
          cursor.setDate(cursor.getDate() + 1);
        }
      }
    }

    documents.forEach((doc) => {
      const date = new Date(doc.date);
      if (Number.isNaN(date.getTime())) return;
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      if (map.has(key)) {
        map.get(key)!.count++;
      }
    });

    return Array.from(map.values()).sort((a, b) =>
      a.dateStr.localeCompare(b.dateStr),
    );
  }, [documents, dailyRange, customMonth, customYear, dateLocale]);

  const dailyTitle = useMemo(() => {
    switch (dailyRange) {
      case "30days":
        return t("stats.daily30");
      case "thisMonth":
        return t("stats.dailyThisMonth");
      case "customMonth": {
        const [y, m] = customMonth.split("-");
        if (y && m) {
          const d = new Date(parseInt(y, 10), parseInt(m, 10) - 1);
          const month = d.toLocaleDateString(dateLocale, {
            month: "long",
            year: "numeric",
          });
          return t("stats.dailyCustomMonth", { month });
        }
        return t("stats.dailyDefault");
      }
      case "thisYear":
        return t("stats.dailyThisYear");
      case "customYear": {
        const y = parseInt(customYear, 10);
        const year =
          locale === "th" ? String(y + 543) : String(y);
        return t("stats.dailyCustomYear", { year });
      }
      default:
        return t("stats.dailyDefault");
    }
  }, [dailyRange, customMonth, customYear, dateLocale, locale, t]);

  const typeChart = {
    labels: [
      t("docType.receipt"),
      t("docType.quotation"),
      t("docType.invoice"),
      t("docType.customPrint"),
    ],
    datasets: [
      {
        data: [
          summary.byType.receipt,
          summary.byType.quotation,
          summary.byType.invoice,
          summary.byType.custom,
        ],
        backgroundColor: ["#10B981", "#8B5CF6", "#F59E0B", "#64748B"],
        borderWidth: 0,
      },
    ],
  };

  const monthEntries = Object.entries(summary.byMonth);
  const monthChart = {
    labels: monthEntries.slice(0, 12).reverse().map(([label]) => label),
    datasets: [
      {
        label: t("stats.chartCount"),
        data: monthEntries.slice(0, 12).reverse().map(([, count]) => count),
        backgroundColor: "#2563eb",
        borderRadius: 8,
      },
    ],
  };

  const lineChart = {
    labels: dailySeries.map((d) => d.label),
    datasets: [
      {
        label: t("stats.chartCount"),
        data: dailySeries.map((d) => d.count),
        borderColor: "#10B981",
        backgroundColor: "rgba(16, 185, 129, 0.12)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const statCards = [
    { label: t("stats.total"), value: summary.total, color: "text-blue-700" },
    { label: t("docType.receipt"), value: summary.byType.receipt, color: "text-emerald-600" },
    { label: t("docType.quotation"), value: summary.byType.quotation, color: "text-violet-600" },
    { label: t("docType.invoice"), value: summary.byType.invoice, color: "text-amber-600" },
    { label: t("docType.customPrint"), value: summary.byType.custom, color: "text-slate-600" },
  ];

  const unitDoc = t("common.unitDoc");

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16">
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell max-w-6xl">
      <PageHeader
        title={t("stats.title")}
        description={t("stats.description")}
      />

      <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-2 lg:grid-cols-5 lg:gap-3">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...smoothTransition, delay: i * 0.04 }}
            className="stat-card"
          >
            <p className="text-xs font-medium text-[var(--text-secondary)] sm:text-sm">
              {card.label}
            </p>
            <p className={`mt-2 text-3xl font-bold ${card.color}`}>
              {card.value} <span className="text-base font-medium">{unitDoc}</span>
            </p>
          </motion.div>
        ))}
      </div>

      <div className="mb-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="liquid-glass p-4 sm:p-5">
          <h2 className="mb-3 text-base font-semibold tracking-tight text-[var(--text-primary)] sm:text-lg">
            {t("stats.typeShare")}
          </h2>
          <div className="h-[280px]">
            <Doughnut
              data={typeChart}
              options={{
                maintainAspectRatio: false,
                plugins: { legend: { position: "bottom" } },
              }}
            />
          </div>
        </div>
        <div className="liquid-glass p-4 sm:p-5">
          <h2 className="mb-3 text-base font-semibold tracking-tight text-[var(--text-primary)] sm:text-lg">
            {t("stats.monthly12")}
          </h2>
          <div className="h-[280px]">
            <Bar
              data={monthChart}
              options={{
                maintainAspectRatio: false,
                scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
              }}
            />
          </div>
        </div>

        <div className="liquid-glass p-4 sm:p-5 lg:col-span-2">
          <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold text-zinc-900">{dailyTitle}</h2>
            <div className="flex flex-wrap gap-2">
              <select
                value={dailyRange}
                onChange={(e) => setDailyRange(e.target.value as DailyRange)}
                className="field-input !w-auto py-2 text-sm"
              >
                <option value="30days">{t("stats.range30")}</option>
                <option value="thisMonth">{t("stats.rangeThisMonth")}</option>
                <option value="customMonth">{t("stats.rangePickMonth")}</option>
                <option value="thisYear">{t("stats.rangeThisYear")}</option>
                <option value="customYear">{t("stats.rangePickYear")}</option>
              </select>
              {dailyRange === "customMonth" && (
                <input
                  type="month"
                  value={customMonth}
                  onChange={(e) => setCustomMonth(e.target.value)}
                  className="field-input !w-auto py-2 text-sm"
                />
              )}
              {dailyRange === "customYear" && (
                <input
                  type="number"
                  min={2020}
                  max={2100}
                  value={customYear}
                  onChange={(e) => setCustomYear(e.target.value)}
                  className="field-input !w-24 py-2 text-sm"
                />
              )}
            </div>
          </div>
          <div className="h-[300px]">
            <Line
              data={lineChart}
              options={{
                maintainAspectRatio: false,
                scales: {
                  y: { beginAtZero: true, ticks: { stepSize: 1 } },
                  x: { ticks: { maxRotation: 45, autoSkip: true, maxTicksLimit: 8 } },
                },
                plugins: {
                  tooltip: {
                    callbacks: {
                      label: (ctx) =>
                        t("stats.countTooltip", { n: String(ctx.raw) }),
                    },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      <StatsTable
        title={dailyTitle}
        rows={[...dailySeries].reverse().slice(0, dailyTableLimit).map((d) => ({
          left: d.label,
          right: `${d.count} ${unitDoc}`,
          key: d.dateStr,
        }))}
        canExpand={dailySeries.length > 7}
        expanded={dailyTableLimit !== 7}
        onToggle={() =>
          setDailyTableLimit((n) => (n === 7 ? dailySeries.length : 7))
        }
        leftHeader={t("stats.colDate")}
        rightHeader={t("stats.colCount")}
      />

      <StatsTable
        title={t("stats.tableMonthly")}
        rows={monthEntries.slice(0, monthlyTableLimit).map(([month, count]) => ({
          left: month,
          right: `${count} ${unitDoc}`,
          key: month,
        }))}
        canExpand={monthEntries.length > 7}
        expanded={monthlyTableLimit !== 7}
        onToggle={() =>
          setMonthlyTableLimit((n) =>
            n === 7 ? monthEntries.length : 7,
          )
        }
        leftHeader={t("stats.colMonth")}
        rightHeader={t("stats.colCount")}
      />

      <StatsTable
        title={t("stats.tableYearly")}
        rows={Object.entries(summary.byYear).map(([year, count]) => ({
          left:
            locale === "th"
              ? t("stats.yearBe", { year: Number(year) + 543 })
              : year,
          right: `${count} ${unitDoc}`,
          key: year,
        }))}
        leftHeader={t("stats.colYear")}
        rightHeader={t("stats.colCount")}
      />
    </div>
  );
}

function StatsTable({
  title,
  rows,
  leftHeader,
  rightHeader,
  canExpand,
  expanded,
  onToggle,
}: {
  title: string;
  rows: { left: string; right: string; key: string }[];
  leftHeader: string;
  rightHeader: string;
  canExpand?: boolean;
  expanded?: boolean;
  onToggle?: () => void;
}) {
  const { t } = useLocale();

  return (
    <div className="liquid-glass mb-4 overflow-hidden p-4 sm:mb-5 sm:p-5">
      <h2 className="mb-4 text-lg font-semibold text-zinc-900">{title}</h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-200 text-left text-xs uppercase text-zinc-500">
            <th className="pb-2 font-medium">{leftHeader}</th>
            <th className="pb-2 text-right font-medium">{rightHeader}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {rows.map((row) => (
            <tr key={row.key}>
              <td className="py-2.5 text-zinc-800">{row.left}</td>
              <td className="py-2.5 text-right text-zinc-800">{row.right}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {canExpand && onToggle && (
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={onToggle}
            className="text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            {expanded ? t("common.seeLess") : t("common.seeMore")}
          </button>
        </div>
      )}
    </div>
  );
}
