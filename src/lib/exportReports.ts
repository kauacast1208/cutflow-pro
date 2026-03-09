import { format } from "date-fns";

interface AppointmentRow {
  date: string;
  start_time: string;
  end_time: string;
  client_name: string;
  client_phone?: string | null;
  status: string;
  price?: number | null;
  services?: { name: string } | null;
  professionals?: { name: string } | null;
}

interface MetricRow {
  label: string;
  value: string;
  sub: string;
}

function escapeCsv(val: string): string {
  if (val.includes(",") || val.includes('"') || val.includes("\n")) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}

export function exportMetricsCsv(metrics: MetricRow[], period: number) {
  const header = "Metrica,Valor,Detalhe";
  const rows = metrics.map(
    (m) => `${escapeCsv(m.label)},${escapeCsv(m.value)},${escapeCsv(m.sub)}`
  );
  const csv = [header, ...rows].join("\n");
  downloadFile(csv, `relatorio-metricas-${period}dias.csv`, "text/csv;charset=utf-8;");
}

export function exportAppointmentsCsv(appointments: AppointmentRow[], period: number) {
  const header = "Data,Horario,Cliente,Telefone,Servico,Profissional,Status,Preco";
  const rows = appointments.map((a) =>
    [
      a.date,
      `${a.start_time}-${a.end_time}`,
      escapeCsv(a.client_name || "-"),
      escapeCsv(a.client_phone || "-"),
      escapeCsv(a.services?.name || "-"),
      escapeCsv(a.professionals?.name || "-"),
      a.status,
      a.price != null ? String(a.price) : "0",
    ].join(",")
  );
  const csv = [header, ...rows].join("\n");
  downloadFile(csv, `agendamentos-${period}dias.csv`, "text/csv;charset=utf-8;");
}

export function exportReportPdf() {
  window.print();
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const bom = "\uFEFF"; // UTF-8 BOM for Excel compatibility
  const blob = new Blob([bom + content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
