/* @vitest-environment jsdom */
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Combobox } from "./Combobox";

const CITIES = [
  { label: "Rome", value: "Rome" },
  { label: "Naples", value: "Naples" },
  { label: "Turin", value: "Turin" },
];

/* jsdom lays nothing out, so the menu's resize watch has nothing to report. */
vi.stubGlobal(
  "ResizeObserver",
  class {
    observe(): void {}
    disconnect(): void {}
  },
);

afterEach(cleanup);

describe("Combobox", () => {
  it("narrows the options to what is typed", async () => {
    render(
      <Combobox
        label="City"
        onChange={() => undefined}
        options={CITIES}
        value=""
      />,
    );

    await userEvent.type(screen.getByRole("combobox", { name: "City" }), "nap");

    expect(
      screen.getAllByRole("option").map((option) => option.textContent),
    ).toEqual(["Naples"]);
  });

  it("reports the option that is picked", async () => {
    const onChange = vi.fn();
    render(
      <Combobox label="City" onChange={onChange} options={CITIES} value="" />,
    );

    await userEvent.type(screen.getByRole("combobox", { name: "City" }), "tur");
    await userEvent.click(screen.getByRole("option", { name: "Turin" }));

    expect(onChange).toHaveBeenCalledWith("Turin");
  });

  it("settles when the empty choice is selected, though it is rebuilt each render", () => {
    /*
     * React only logs an endless loop of effect updates and keeps looping, and
     * no timeout can interrupt that, so the log has to throw for the test to
     * fail instead of hanging.
     */
    const errors = vi.spyOn(console, "error").mockImplementation((message) => {
      throw new Error(String(message));
    });
    const props = {
      emptyLabel: "None",
      label: "Company",
      onChange: () => undefined,
      options: CITIES,
      value: "",
    };
    const { rerender } = render(<Combobox {...props} />);

    rerender(<Combobox {...props} />);

    expect(errors).not.toHaveBeenCalled();
    errors.mockRestore();
  });
});
