import { afterEach, describe, expect, it, vi } from "vitest";
import {
  InspectError,
  inspectEndpoint,
  inspectImage,
  normalizeInspectResponse,
  toJpegDataUrl,
} from "@/lib/inspect-api";
import { csvCell, inspectionsToCsv, REPORT_COLUMNS } from "@/lib/csv-report";

const png = () => new File([new Uint8Array([1, 2, 3])], "blade.png", { type: "image/png" });

afterEach(() => vi.unstubAllGlobals());

describe("inspection service client", () => {
  it("posts to {base}/inspect without doubling slashes", () => {
    expect(inspectEndpoint("https://api.example.com/")).toBe("https://api.example.com/inspect");
  });

  it("sends the image as multipart/form-data under the field name 'file'", async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ filename: "blade.png" }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    await inspectImage(png(), { baseUrl: "https://api.example.com" });
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://api.example.com/inspect");
    expect(init.method).toBe("POST");
    expect((init.body as FormData).get("file")).toBeInstanceOf(File);
  });

  it("refuses to run with no service address configured", async () => {
    await expect(inspectImage(png(), { baseUrl: "" })).rejects.toBeInstanceOf(InspectError);
  });

  it("rejects file types the service does not accept", async () => {
    const tiff = new File([new Uint8Array([1])], "x.tiff", { type: "image/tiff" });
    await expect(inspectImage(tiff, { baseUrl: "https://api.example.com" })).rejects.toThrow(/JPG, PNG or WEBP/);
  });

  it("surfaces the FastAPI error detail on HTTP errors", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ detail: "Invalid image" }), { status: 400 })));
    await expect(inspectImage(png(), { baseUrl: "https://api.example.com" })).rejects.toThrow("Inspection failed (HTTP 400): Invalid image");
  });

  it("converts raw base64 annotated_image into a JPEG data URL", () => {
    expect(toJpegDataUrl("/9j/4AAQ")).toBe("data:image/jpeg;base64,/9j/4AAQ");
    expect(toJpegDataUrl("data:image/jpeg;base64,abc")).toBe("data:image/jpeg;base64,abc");
  });

  it("reads the service's metrics from the response", () => {
    const r = normalizeInspectResponse(
      {
        filename: "blade.png",
        width: 1280,
        height: 896,
        total_detected_regions: 7,
        mean_brightness: 112.4,
        edge_pixel_ratio: 0.0412,
        inspection_status: "Candidate defects detected",
        warning: "Demonstration system",
        annotated_image: "abc",
      },
      "fallback.png",
    );
    expect(r).toMatchObject({
      filename: "blade.png",
      width: 1280,
      height: 896,
      totalRegions: 7,
      meanBrightness: 112.4,
      edgePixelRatio: 0.0412,
      status: "Candidate defects detected",
      warning: "Demonstration system",
      annotatedImage: "data:image/jpeg;base64,abc",
    });
  });

  it("reads dimensions given as an object", () => {
    const r = normalizeInspectResponse({ image_dimensions: { width: 640, height: 480 } }, "a.png");
    expect([r.width, r.height]).toEqual([640, 480]);
  });
});

describe("CSV report", () => {
  it("quotes cells containing commas or quotes", () => {
    expect(csvCell('panel, "A"')).toBe('"panel, ""A"""');
  });

  it("includes every metric column and a candidate-defect disclaimer", () => {
    const csv = inspectionsToCsv([
      {
        id: "LIVE-1",
        inspectedAt: "2026-11-15T19:00:00.000Z",
        fileSizeBytes: 3,
        serviceUrl: "https://api.example.com",
        filename: "blade.png",
        width: 1280,
        height: 896,
        totalRegions: 7,
        meanBrightness: 112.4,
        edgePixelRatio: 0.0412,
        status: "Candidate defects detected",
        warning: null,
      },
    ]);
    const [header, row] = csv.replace("\uFEFF", "").trim().split("\r\n");
    expect(header).toBe(REPORT_COLUMNS.join(","));
    expect(row).toContain("LIVE-1,2026-11-15T19:00:00.000Z,blade.png,3,1280,896,7,112.4,0.0412,Candidate defects detected");
    expect(row).toMatch(/Not validated aerospace defects/);
  });
});
