// ─────────────────────────────────────────────────────────────────────────
// SIZE GUIDE DATA — single source of truth for the product-page popup AND the
// /size-guide page. Edit the numbers here and both update.
//
// UK size chart (sizes 4–28). Bust / waist / hip are body measurements in
// inches. Source: Mhira's supplied UK size chart.
// ─────────────────────────────────────────────────────────────────────────

export interface SizeRow {
  size: string; // UK size number
  bust: string; // inches
  waist: string; // inches
  hip: string; // inches
}

export const SIZE_CHART: SizeRow[] = [
  { size: "4", bust: "34", waist: "26", hip: "37" },
  { size: "6", bust: "35", waist: "27", hip: "38" },
  { size: "8", bust: "36", waist: "28", hip: "39" },
  { size: "10", bust: "37", waist: "29", hip: "40" },
  { size: "12", bust: "38", waist: "30", hip: "41" },
  { size: "14", bust: "39.5", waist: "31.5", hip: "43" },
  { size: "16", bust: "41", waist: "33", hip: "44" },
  { size: "18", bust: "43", waist: "35", hip: "46" },
  { size: "20", bust: "45", waist: "37", hip: "48" },
  { size: "22", bust: "47", waist: "39", hip: "50" },
  { size: "24", bust: "49", waist: "41", hip: "52" },
  { size: "26", bust: "51", waist: "43", hip: "55" },
  { size: "28", bust: "53", waist: "45", hip: "57" },
];

// Shown under the table.
export const SIZE_NOTE = "Standard length = 60 inches.";

export const MEASURE_TIPS: { label: string; tip: string }[] = [
  {
    label: "Bust",
    tip: "Measure around the fullest part of your chest, keeping the tape level.",
  },
  {
    label: "Waist",
    tip: "Measure around the narrowest part of your natural waistline.",
  },
  {
    label: "Hip",
    tip: "Measure around the fullest part of your hips, about 20cm below the waist.",
  },
];
