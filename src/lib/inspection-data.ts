/**
 * DEMONSTRATION DATA ONLY.
 * No AI defect-detection model is connected to this prototype. Every defect,
 * bounding box and confidence score below is hand-authored sample data.
 */
import turbineBlade from "@/assets/sample-turbine-blade.jpg";
import fuselagePanel from "@/assets/sample-fuselage-panel.jpg";
import wingLeadingEdge from "@/assets/sample-wing-leading-edge.jpg";
import landingGear from "@/assets/sample-landing-gear.jpg";

export type DefectType = "crack" | "corrosion" | "dent" | "scratch";
export type Severity = "minor" | "major" | "critical";
export type InspectionStatus = "pass" | "fail" | "review";

export interface Defect {
  id: string;
  type: DefectType;
  confidence: number; // 0–1
  severity: Severity;
  /** Bounding box as percentages of image width/height */
  box: { x: number; y: number; w: number; h: number };
  location: string;
  size: string;
}

export interface Inspection {
  id: string;
  component: string;
  partNumber: string;
  serial: string;
  aircraft: string;
  station: string;
  inspector: string;
  date: string; // ISO
  status: InspectionStatus;
  defects: Defect[];
  image?: string;
  durationSec: number;
}

export const DEFECT_META: Record<
  DefectType,
  { label: string; code: string; colorVar: string; textClass: string; bgClass: string; borderClass: string }
> = {
  crack: {
    label: "Crack",
    code: "CRK",
    colorVar: "var(--defect-crack)",
    textClass: "text-defect-crack",
    bgClass: "bg-defect-crack",
    borderClass: "border-defect-crack",
  },
  corrosion: {
    label: "Corrosion",
    code: "COR",
    colorVar: "var(--defect-corrosion)",
    textClass: "text-defect-corrosion",
    bgClass: "bg-defect-corrosion",
    borderClass: "border-defect-corrosion",
  },
  dent: {
    label: "Dent",
    code: "DNT",
    colorVar: "var(--defect-dent)",
    textClass: "text-defect-dent",
    bgClass: "bg-defect-dent",
    borderClass: "border-defect-dent",
  },
  scratch: {
    label: "Scratch",
    code: "SCR",
    colorVar: "var(--defect-scratch)",
    textClass: "text-defect-scratch",
    bgClass: "bg-defect-scratch",
    borderClass: "border-defect-scratch",
  },
};

export const DEFECT_TYPES: DefectType[] = ["crack", "corrosion", "dent", "scratch"];

/** Demo rule: any critical finding fails; any major finding needs engineering review. */
export function deriveStatus(defects: Defect[]): InspectionStatus {
  if (defects.some((d) => d.severity === "critical")) return "fail";
  if (defects.some((d) => d.severity === "major")) return "review";
  return "pass";
}

const sampleInspections: Inspection[] = [
  {
    id: "INS-2611-0418",
    component: "HPT Stage 1 Turbine Blade",
    partNumber: "PN 2045M31-P04",
    serial: "SN TB-77213",
    aircraft: "A320neo · LEAP-1A",
    station: "Engine Shop · Bay 2",
    inspector: "R. Okafor",
    date: "2026-11-10T19:42:00Z",
    status: "fail",
    image: turbineBlade,
    durationSec: 4.2,
    defects: [
      {
        id: "CRK-01",
        type: "crack",
        confidence: 0.94,
        severity: "critical",
        box: { x: 25, y: 47, w: 14, h: 9 },
        location: "Platform-to-airfoil fillet, root",
        size: "≈ 11.8 mm",
      },
      {
        id: "SCR-01",
        type: "scratch",
        confidence: 0.81,
        severity: "minor",
        box: { x: 55, y: 40, w: 19, h: 9 },
        location: "Pressure side, mid-span",
        size: "≈ 18.2 mm",
      },
    ],
  },
  {
    id: "INS-2611-0417",
    component: "Fuselage Skin Panel, Sec. 44",
    partNumber: "PN D533-1172-9",
    serial: "SN FP-40981",
    aircraft: "B737-800 · EI-FRT",
    station: "Hangar 3 · Line B",
    inspector: "M. Lindqvist",
    date: "2026-11-10T17:15:00Z",
    status: "review",
    image: fuselagePanel,
    durationSec: 5.1,
    defects: [
      {
        id: "COR-01",
        type: "corrosion",
        confidence: 0.91,
        severity: "major",
        box: { x: 8, y: 41, w: 45, h: 55 },
        location: "Lower lap joint, frames 18–21",
        size: "≈ 210 × 160 mm",
      },
      {
        id: "COR-02",
        type: "corrosion",
        confidence: 0.77,
        severity: "minor",
        box: { x: 36, y: 59, w: 7, h: 9 },
        location: "Fastener row C, rivet 14",
        size: "≈ 9 mm Ø",
      },
    ],
  },
  {
    id: "INS-2611-0416",
    component: "Wing Leading Edge, Slat 3",
    partNumber: "PN 113A4210-7",
    serial: "SN LE-22018",
    aircraft: "A321 · G-OZBR",
    station: "Hangar 1 · Line A",
    inspector: "S. Haddad",
    date: "2026-11-10T14:03:00Z",
    status: "review",
    image: wingLeadingEdge,
    durationSec: 3.8,
    defects: [
      {
        id: "DNT-01",
        type: "dent",
        confidence: 0.96,
        severity: "major",
        box: { x: 43, y: 40, w: 13, h: 19 },
        location: "Slat 3 outboard, 0.4 m from tip",
        size: "≈ 42 mm Ø · 1.6 mm depth",
      },
      {
        id: "SCR-01",
        type: "scratch",
        confidence: 0.68,
        severity: "minor",
        box: { x: 46, y: 46, w: 8, h: 7 },
        location: "Within dent, paint abrasion",
        size: "≈ 20 mm",
      },
    ],
  },
  {
    id: "INS-2611-0415",
    component: "MLG Shock Strut Piston",
    partNumber: "PN 201585001",
    serial: "SN LG-09344",
    aircraft: "A320 · D-AIZW",
    station: "Hangar 3 · Line B",
    inspector: "R. Okafor",
    date: "2026-11-10T11:27:00Z",
    status: "review",
    image: landingGear,
    durationSec: 4.6,
    defects: [
      {
        id: "SCR-01",
        type: "scratch",
        confidence: 0.89,
        severity: "major",
        box: { x: 39, y: 29, w: 20, h: 35 },
        location: "Chrome sliding surface, seal zone",
        size: "≈ 96 mm length",
      },
    ],
  },
];

const historyOnly: Inspection[] = [
  ["INS-2611-0414", "Compressor Fan Blade #12", "PN 340-123-501", "SN FB-11902", "A320neo · LEAP-1A", "Engine Shop · Bay 1", "M. Lindqvist", "2026-11-09T21:10:00Z", [] as Defect[]],
  ["INS-2611-0413", "Horizontal Stabilizer Skin", "PN 65C2210-3", "SN HS-60231", "B737-800 · EI-FRT", "Hangar 3 · Line B", "S. Haddad", "2026-11-09T18:44:00Z", [{ id: "SCR-01", type: "scratch", confidence: 0.72, severity: "minor", box: { x: 0, y: 0, w: 0, h: 0 }, location: "Upper skin, sta. 140", size: "≈ 14 mm" }]],
  ["INS-2611-0412", "Nose Landing Gear Axle", "PN 114B8302-1", "SN NG-33019", "A321 · G-OZBR", "Hangar 1 · Line A", "J. Moreau", "2026-11-09T15:02:00Z", [{ id: "COR-01", type: "corrosion", confidence: 0.88, severity: "critical", box: { x: 0, y: 0, w: 0, h: 0 }, location: "Axle bore, inboard", size: "≈ 30 mm" }]],
  ["INS-2611-0411", "Engine Inlet Cowl Lip", "PN 7101-883-02", "SN IC-55412", "A320 · D-AIZW", "Engine Shop · Bay 2", "R. Okafor", "2026-11-09T10:36:00Z", []],
  ["INS-2611-0410", "Cargo Door Hinge Fitting", "PN 311W1405-6", "SN CD-70214", "B737-800 · EI-FRT", "Hangar 3 · Line B", "J. Moreau", "2026-11-08T20:18:00Z", [{ id: "CRK-01", type: "crack", confidence: 0.83, severity: "critical", box: { x: 0, y: 0, w: 0, h: 0 }, location: "Lug radius", size: "≈ 4.2 mm" }]],
  ["INS-2611-0409", "Flap Track Fairing", "PN 113N5530-11", "SN FT-81120", "A321 · G-OZBR", "Hangar 1 · Line A", "S. Haddad", "2026-11-08T16:51:00Z", [{ id: "DNT-01", type: "dent", confidence: 0.79, severity: "minor", box: { x: 0, y: 0, w: 0, h: 0 }, location: "Aft fairing, lower", size: "≈ 18 mm Ø" }]],
  ["INS-2611-0408", "LPT Stage 3 Vane Segment", "PN 2047M89-G02", "SN LV-44310", "A320neo · LEAP-1A", "Engine Shop · Bay 1", "M. Lindqvist", "2026-11-08T12:09:00Z", []],
  ["INS-2611-0407", "Wing Root Fillet Panel", "PN D541-2280-4", "SN WR-10928", "A320 · D-AIZW", "Hangar 3 · Line B", "J. Moreau", "2026-11-07T19:30:00Z", []],
].map(([id, component, partNumber, serial, aircraft, station, inspector, date, defects]) => {
  const d = defects as Defect[];
  return {
    id: id as string,
    component: component as string,
    partNumber: partNumber as string,
    serial: serial as string,
    aircraft: aircraft as string,
    station: station as string,
    inspector: inspector as string,
    date: date as string,
    defects: d,
    status: deriveStatus(d),
    durationSec: 3.4 + (d.length % 3) * 0.7,
  };
});

export const SAMPLE_INSPECTIONS = sampleInspections;
export const INSPECTION_HISTORY: Inspection[] = [...sampleInspections, ...historyOnly];

/** Demonstration fleet-level totals (last 30 days). */
export const OVERVIEW_STATS = {
  totalInspections: { value: 1284, delta: "+8.2%", note: "vs. previous 30 days" },
  defectsDetected: { value: 317, delta: "+3.1%", note: "across 214 components" },
  componentsPassed: { value: 1070, delta: "83.3%", note: "first-pass yield" },
  componentsFailed: { value: 61, delta: "4.8%", note: "153 sent to engineering review" },
};

export const WEEKLY_TREND = [
  { week: "W38", pass: 228, review: 31, fail: 12 },
  { week: "W39", pass: 241, review: 27, fail: 9 },
  { week: "W40", pass: 236, review: 38, fail: 15 },
  { week: "W41", pass: 259, review: 33, fail: 11 },
  { week: "W42", pass: 247, review: 29, fail: 13 },
  { week: "W43", pass: 268, review: 35, fail: 10 },
];

export const DEFECT_DISTRIBUTION: { type: DefectType; count: number }[] = [
  { type: "scratch", count: 128 },
  { type: "corrosion", count: 94 },
  { type: "dent", count: 61 },
  { type: "crack", count: 34 },
];

export const DEFECTS_BY_COMPONENT = [
  { group: "Turbine blades", crack: 14, corrosion: 6, dent: 3, scratch: 22 },
  { group: "Fuselage skin", crack: 5, corrosion: 41, dent: 18, scratch: 37 },
  { group: "Wing surfaces", crack: 4, corrosion: 19, dent: 29, scratch: 31 },
  { group: "Landing gear", crack: 8, corrosion: 22, dent: 5, scratch: 26 },
  { group: "Nacelles", crack: 3, corrosion: 6, dent: 6, scratch: 12 },
];

/** Placeholder findings shown for a user-uploaded image. Not derived from the image. */
export const DEMO_UPLOAD_DEFECTS: Defect[] = [
  {
    id: "SCR-01",
    type: "scratch",
    confidence: 0.84,
    severity: "minor",
    box: { x: 22, y: 30, w: 24, h: 10 },
    location: "Demo region A",
    size: "—",
  },
  {
    id: "COR-01",
    type: "corrosion",
    confidence: 0.76,
    severity: "major",
    box: { x: 58, y: 52, w: 18, h: 22 },
    location: "Demo region B",
    size: "—",
  },
];
