import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";

import { Popover } from "./Popover";

/* jsdom lays nothing out, so any box stands in for the trigger's. */
const ANCHOR = new DOMRect(10, 10, 40, 40);

describe("Popover", () => {
  it("moves focus into the menu when it opens", () => {
    render(
      <Popover
        anchor={ANCHOR}
        label="Language"
        onClose={() => undefined}
        placement="below"
        triggerRef={createRef()}
      >
        <button type="button">English</button>
      </Popover>,
    );

    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "English" }),
    );
  });

  it("closes on Escape and on a press outside it", () => {
    const onClose = vi.fn();
    render(
      <Popover
        anchor={ANCHOR}
        label="Language"
        onClose={onClose}
        placement="below"
        triggerRef={createRef()}
      >
        <button type="button">English</button>
      </Popover>,
    );

    fireEvent.keyDown(document, { key: "Escape" });
    fireEvent.pointerDown(document.body);

    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it("renders nothing while it has no trigger box", () => {
    render(
      <Popover
        anchor={null}
        label="Language"
        onClose={() => undefined}
        placement="below"
        triggerRef={createRef()}
      >
        <button type="button">English</button>
      </Popover>,
    );

    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
