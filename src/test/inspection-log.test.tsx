import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { normalizeInspectResponse } from "@/lib/inspect-api";
import { createLoggedInspection, logInspection, useInspectionLog } from "@/lib/inspection-log";
import { inspectionsToCsv } from "@/lib/csv-report";

const timestamp = new Date("2026-11-19T18:20:00.000Z");
const serviceUrl = "https://inspection.example.com";
const responses = [
  { filename: "blade.png", image_dimensions: { width: 1280, height: 896 }, edge_detection: { total_regions: 1 }, image_analysis: { mean_brightness: 91.96, edge_pixel_ratio: 0.0175 }, inspection_status: "Image processed successfully", annotated_image: "abc" },
  { filename: "panel.png", image_dimensions: { width: 640, height: 480 }, edge_detection: { total_regions: 7 }, image_analysis: { mean_brightness: 112.4, edge_pixel_ratio: 0.0412 }, inspection_status: "Candidate regions detected", annotated_image: "def" },
  { filename: "gear.png", image_dimensions: { width: 800, height: 600 }, edge_detection: { total_regions: 0 }, image_analysis: { mean_brightness: 0, edge_pixel_ratio: 0 }, inspection_status: "Image processed successfully", annotated_image: "ghi" },
];

function entries() {
  return responses.map((response, index) => createLoggedInspection(normalizeInspectResponse(response, "fallback.png"), { size: 100 + index }, serviceUrl, timestamp));
}

beforeEach(() => window.localStorage.clear());
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe("live inspection record integrity", () => {
  it("gives inspections completed at the same timestamp distinct IDs", () => {
    const records = entries();
    expect(new Set(records.map((record) => record.id)).size).toBe(3);
    expect(records.every((record) => record.id.startsWith("LIVE-"))).toBe(true);
  });

  it.each(responses.map((response, index) => [response.filename, index] as const))("preserves every API metric for %s without annotated images", (_name, index) => {
    const record = entries()[index];
    const response = responses[index];
    expect(record).toMatchObject({
      filename: response.filename, fileSizeBytes: 100 + index,
      inspectedAt: "2026-11-19T18:20:00.000Z", serviceUrl,
      width: response.image_dimensions.width, height: response.image_dimensions.height,
      totalRegions: response.edge_detection.total_regions,
      meanBrightness: response.image_analysis.mean_brightness,
      edgePixelRatio: response.image_analysis.edge_pixel_ratio,
      status: response.inspection_status,
    });
    expect(record).not.toHaveProperty("annotatedImage");
    expect(record).not.toHaveProperty("confidence");
  });

  it("keeps all individual records after history is read again", () => {
    const records = entries();
    const first = renderHook(() => useInspectionLog());
    act(() => records.forEach(logInspection));
    expect(first.result.current).toEqual([...records].reverse());
    first.unmount();
    const restored = renderHook(() => useInspectionLog());
    expect(restored.result.current).toEqual([...records].reverse());
    expect(JSON.parse(window.localStorage.getItem("aeroinspect.liveHistory.v1") ?? "[]")).toEqual([...records].reverse());
  });

  it("does not overwrite an earlier response when another image completes", () => {
    const result = normalizeInspectResponse(responses[0], "fallback.png");
    const record = createLoggedInspection(result, { size: 100 }, serviceUrl, timestamp);
    logInspection(record);
    result.totalRegions = 999;
    logInspection(entries()[1]);
    const history = renderHook(() => useInspectionLog());
    expect(history.result.current.find((row) => row.id === record.id)?.totalRegions).toBe(1);
  });

  it("exports matching individual and bulk metrics at full API precision", () => {
    const records = entries();
    const bulk = inspectionsToCsv(records).replace("\uFEFF", "").trim().split("\r\n");
    records.forEach((record, index) => {
      const individual = inspectionsToCsv([record]).replace("\uFEFF", "").trim().split("\r\n");
      expect(bulk[index + 1]).toBe(individual[1]);
      expect(individual[1].split(",").slice(0, 10)).toEqual([
        record.id, "2026-11-19T18:20:00.000Z", responses[index].filename,
        String(100 + index), String(responses[index].image_dimensions.width),
        String(responses[index].image_dimensions.height), String(responses[index].edge_detection.total_regions),
        String(responses[index].image_analysis.mean_brightness), String(responses[index].image_analysis.edge_pixel_ratio),
        responses[index].inspection_status,
      ]);
    });
  });

  it("leaves missing live metrics empty in CSV instead of inventing results", () => {
    const record = createLoggedInspection(normalizeInspectResponse({ filename: "missing.png" }, "fallback.png"), { size: 12 }, serviceUrl, timestamp);
    expect([record.width, record.height, record.totalRegions, record.meanBrightness, record.edgePixelRatio]).toEqual([null, null, null, null, null]);
    expect(inspectionsToCsv([record]).split("\r\n")[1].split(",").slice(4, 10)).toEqual(["", "", "", "", "", "Unknown"]);
  });

  it("surfaces storage failure rather than pretending a record was saved", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new DOMException("Storage full", "QuotaExceededError"); });
    expect(() => logInspection(entries()[0])).toThrow("Storage full");
    expect(renderHook(() => useInspectionLog()).result.current).toEqual([]);
  });
});