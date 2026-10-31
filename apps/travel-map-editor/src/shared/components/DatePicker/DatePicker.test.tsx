/* @vitest-environment jsdom */
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DatePicker } from "./DatePicker";

/* jsdom lays nothing out, so the panel's resize watch has nothing to report. */
vi.stubGlobal(
  "ResizeObserver",
  class {
    observe(): void {}
    disconnect(): void {}
  },
);

afterEach(cleanup);

describe("DatePicker", () => {
  it("reaches an old date through the year and month grids", async () => {
    const onChange = vi.fn();
    render(<DatePicker label="Start" onChange={onChange} value="2026-10-15" />);

    await userEvent.click(screen.getByRole("button", { name: /^Start/ }));
    await userEvent.click(
      screen.getByRole("button", { name: "datePicker.chooseYear" }),
    );
    await userEvent.click(
      screen.getByRole("button", { name: "datePicker.previous.years" }),
    );
    await userEvent.click(screen.getByRole("button", { name: "2014" }));
    await userEvent.click(
      screen.getByRole("button", { name: "datePicker.chooseMonth" }),
    );
    const march = new Intl.DateTimeFormat(undefined, { month: "short" }).format(
      new Date(2024, 2, 1),
    );
    await userEvent.click(screen.getByRole("button", { name: march }));
    await userEvent.click(screen.getByRole("button", { name: "12" }));

    expect(onChange).toHaveBeenCalledWith("2014-03-12");
  });
});
