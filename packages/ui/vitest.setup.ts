import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

/*
 * jsdom has no modal dialogs yet. Opening one only needs to set `open`, which
 * is what makes the dialog and its contents visible to the queries.
 */
HTMLDialogElement.prototype.showModal = function showModal(): void {
  this.open = true;
};
HTMLDialogElement.prototype.close = function close(): void {
  this.open = false;
};

afterEach(cleanup);
