import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MapPin, Route } from "lucide-react";
import { describe, expect, it, vi } from "vitest";

import { NavRail } from "./NavRail";

const ITEMS = [
  { icon: Route, id: "trips", label: "Trips" },
  { icon: MapPin, id: "places", label: "Places" },
];

describe("NavRail", () => {
  it("marks the tab of the page on screen as current", () => {
    render(
      <NavRail
        activeId="places"
        isDarkTheme={false}
        items={ITEMS}
        logoLabel="Home"
        onLogo={() => undefined}
        onSelect={() => undefined}
        onToggleTheme={() => undefined}
      />,
    );

    expect(screen.getByRole("button", { name: "Places" })).toHaveProperty(
      "ariaCurrent",
      "page",
    );
    expect(screen.getByRole("button", { name: "Trips" })).toHaveProperty(
      "ariaCurrent",
      null,
    );
  });

  it("opens the tab that is pressed", async () => {
    const onSelect = vi.fn();
    render(
      <NavRail
        activeId="trips"
        isDarkTheme={false}
        items={ITEMS}
        logoLabel="Home"
        onLogo={() => undefined}
        onSelect={onSelect}
        onToggleTheme={() => undefined}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "Places" }));

    expect(onSelect).toHaveBeenCalledWith("places");
  });

  it("leaves the logo out of the phone's tab bar", () => {
    render(
      <NavRail
        activeId="trips"
        isCompact
        isDarkTheme={false}
        items={ITEMS}
        logoLabel="Home"
        onLogo={() => undefined}
        onSelect={() => undefined}
        onToggleTheme={() => undefined}
      />,
    );

    expect(screen.queryByRole("button", { name: "Home" })).toBeNull();
  });
});
