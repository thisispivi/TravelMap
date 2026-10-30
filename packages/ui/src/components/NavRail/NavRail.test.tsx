import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MapPin, Route } from "lucide-react";
import { describe, expect, it, vi } from "vitest";

import { NavRail } from "./NavRail";

const ITEMS = [
  { href: "/trips", icon: Route, id: "trips", label: "Trips" },
  { href: "/places", icon: MapPin, id: "places", label: "Places" },
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

    expect(screen.getByRole("link", { name: "Places" })).toHaveProperty(
      "ariaCurrent",
      "page",
    );
    expect(screen.getByRole("link", { name: "Trips" })).toHaveProperty(
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

    await userEvent.click(screen.getByRole("link", { name: "Places" }));

    expect(onSelect).toHaveBeenCalledWith("places");
  });

  it("leaves a press with Ctrl held to the browser, which opens a new tab", () => {
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

    fireEvent.click(screen.getByRole("link", { name: "Places" }), {
      ctrlKey: true,
    });

    expect(onSelect).not.toHaveBeenCalled();
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
