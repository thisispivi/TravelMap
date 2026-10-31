/* @vitest-environment jsdom */
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ToastProvider } from "../Toast/Toast";
import { ImageUploadField } from "./ImageUploadField";

afterEach(cleanup);

describe("ImageUploadField", () => {
  it("uploads an SVG as JSON without decoding it in the page", async () => {
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
