import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const toCell = (value) => {
  if (value === null || value === undefined) return "";
  return String(value);
};

const triggerDownload = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

/**
 * Exporte des données tabulaires en CSV (compatible Excel, accents préservés).
 * @param {{ filename: string, headers?: string[], rows: Array<Array<any>> }} opts
 */
export function downloadCsv({ filename, headers = [], rows = [] }) {
  const escape = (val) => `"${toCell(val).replace(/"/g, '""')}"`;
  const lines = [];
  if (headers.length) lines.push(headers.map(escape).join(";"));
  rows.forEach((row) => lines.push(row.map(escape).join(";")));
  // BOM UTF-8 pour qu'Excel affiche correctement les accents
  const csv = "\uFEFF" + lines.join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  triggerDownload(blob, filename.endsWith(".csv") ? filename : `${filename}.csv`);
}

/**
 * Exporte des données tabulaires en PDF (rendu vectoriel via jsPDF-AutoTable,
 * indépendant du DOM — donc insensible aux couleurs oklch de Tailwind v4).
 * @param {{ filename: string, title?: string, subtitle?: string, headers?: string[], rows: Array<Array<any>>, orientation?: "portrait"|"landscape" }} opts
 */
export function downloadPdf({
  filename,
  title,
  subtitle,
  headers = [],
  rows = [],
  orientation = "landscape",
}) {
  const doc = new jsPDF({ orientation, unit: "pt", format: "a4" });
  const marginX = 40;
  let y = 46;

  if (title) {
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(title, marginX, y);
    y += 16;
  }

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(120);
  const generatedAt = `Généré le ${new Date().toLocaleString("fr-FR")}`;
  doc.text(subtitle ? `${subtitle} — ${generatedAt}` : generatedAt, marginX, y);
  doc.setTextColor(0);
  y += 10;

  autoTable(doc, {
    startY: y,
    head: headers.length ? [headers] : undefined,
    body: rows.map((row) => row.map(toCell)),
    margin: { left: marginX, right: marginX },
    styles: { fontSize: 9, cellPadding: 5, overflow: "linebreak" },
    headStyles: { fillColor: [79, 70, 229], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [248, 250, 252] },
  });

  doc.save(filename.endsWith(".pdf") ? filename : `${filename}.pdf`);
}

/**
 * Génère un PDF "fiche" à partir de paires libellé/valeur (pour un enregistrement unique).
 * @param {{ filename: string, title: string, sections: Array<{ heading?: string, rows: Array<[string, any]> }> }} opts
 */
export function downloadRecordPdf({ filename, title, sections = [] }) {
  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
  const marginX = 40;
  let y = 46;

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(title, marginX, y);
  y += 14;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(120);
  doc.text(`Généré le ${new Date().toLocaleString("fr-FR")}`, marginX, y);
  doc.setTextColor(0);
  y += 12;

  sections.forEach((section) => {
    autoTable(doc, {
      startY: y + 6,
      head: section.heading ? [[section.heading, ""]] : undefined,
      body: section.rows.map(([label, value]) => [label, toCell(value)]),
      margin: { left: marginX, right: marginX },
      styles: { fontSize: 10, cellPadding: 5, overflow: "linebreak" },
      headStyles: { fillColor: [79, 70, 229], textColor: 255, fontStyle: "bold" },
      columnStyles: { 0: { fontStyle: "bold", cellWidth: 160, textColor: [71, 85, 105] } },
    });
    y = doc.lastAutoTable.finalY;
  });

  doc.save(filename.endsWith(".pdf") ? filename : `${filename}.pdf`);
}
