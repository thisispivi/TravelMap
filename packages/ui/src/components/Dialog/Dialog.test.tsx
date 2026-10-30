import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Dialog } from "./Dialog";

describe("Dialog", () => {
  it("opens as a modal named by its title", () => {
    render(
      <Dialog onClose={() => undefined} title="Add place">
        <p>Body</p>
      </Dialog>,
    );

    expect(screen.getByRole("dialog", { name: "Add place" })).toHaveProperty(
      "open",
      true,
    );
  });

  it("closes on Escape", () => {
    const onClose = vi.fn();
    render(
      <Dialog onClose={onClose} title="Add place">
        <p>Body</p>
      </Dialog>,
    );

    fireEvent(screen.getByRole("dialog"), new Event("cancel"));

    expect(onClose).toHaveBeenCalledOnce();
  });

  it("stays open on Escape while it cannot close", () => {
    const onClose = vi.fn();
    render(
      <Dialog canClose={false} onClose={onClose} title="Uploading">
        <p>Body</p>
      </Dialog>,
    );

    const cancel = new Event("cancel", { cancelable: true });
    fireEvent(screen.getByRole("dialog"), cancel);

    expect(onClose).not.toHaveBeenCalled();
    expect(cancel.defaultPrevented).toBe(true);
  });

  it("shows its actions in a strip along its foot", () => {
    render(
      <Dialog
        actions={<button type="button">Save</button>}
        onClose={() => undefined}
        title="Edit"
      >
        <p>Body</p>
      </Dialog>,
    );

    expect(
      screen
        .getByRole("contentinfo")
        .contains(screen.getByRole("button", { name: "Save" })),
    ).toBe(true);
  });
});
