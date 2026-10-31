/* @vitest-environment jsdom */
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ToastProvider } from "../Toast/Toast";
import { ImageUploadField } from "./ImageUploadField";

/* jsdom decodes no images and draws no canvases, so the preview is stubbed. */
URL.createObjectURL = vi.fn(() => "blob:logo");
URL.revokeObjectURL = vi.fn();
HTMLImageElement.prototype.decode = vi.fn(() => Promise.resolve());
vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
  drawImage: vi.fn(),
} as never);

afterEach(cleanup);

describe("ImageUploadField", () => {
  it("sends the logo as the JSON request the asset writer requires", async () => {
    const fetchMock = vi.fn(() =>
      Promise.resolve(Response.json({ path: "/logos/uber.svg" })),
    );
    vi.stubGlobal("fetch", fetchMock);
    const onUpload = vi.fn();
    render(
      <ToastProvider>
        <ImageUploadField
          fileNameHint="uber"
          label="Logo"
          onUpload={onUpload}
        />
      </ToastProvider>,
    );

    await userEvent.upload(
      screen.getByLabelText(/imageUploadField\.choose/),
      new File(["<svg/>"], "uber-icon.svg", { type: "image/svg+xml" }),
    );

    await waitFor(() =>
      expect(onUpload).toHaveBeenCalledWith("/logos/uber.svg"),
    );
    expect(fetchMock).toHaveBeenCalledWith(
      "/__assets/write",
      expect.objectContaining({
        headers: { "Content-Type": "application/json" },
      }),
    );
  });
});
