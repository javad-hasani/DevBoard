import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getDemoAnalysis } from "@/infrastructure/demo-data";
import { exportExcel, exportPdf } from "./export-report";

describe("report exports", () => {
  const createObjectURL = vi.fn((blob: Blob) => {
    void blob;
    return "blob:devboard";
  });
  const revokeObjectURL = vi.fn((url: string) => {
    void url;
  });

  beforeEach(() => {
    createObjectURL.mockClear();
    revokeObjectURL.mockClear();
    Object.defineProperty(URL, "createObjectURL", { configurable: true, value: createObjectURL });
    Object.defineProperty(URL, "revokeObjectURL", { configurable: true, value: revokeObjectURL });
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("creates a populated Excel workbook blob", async () => {
    await exportExcel(getDemoAnalysis("octocat"));
    const blob = createObjectURL.mock.calls[0][0] as Blob;
    expect(blob.type).toBe("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    expect(blob.size).toBeGreaterThan(1000);
  });

  it("creates a populated PDF blob", async () => {
    await exportPdf(getDemoAnalysis("octocat"));
    const blob = createObjectURL.mock.calls[0][0] as Blob;
    expect(blob.type).toBe("application/pdf");
    expect(blob.size).toBeGreaterThan(1000);
  });
});
