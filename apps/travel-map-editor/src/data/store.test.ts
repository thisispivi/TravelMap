import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

beforeEach(() => vi.resetModules());
afterEach(() => vi.unstubAllGlobals());

describe("dataset persistence", () => {
  it("keeps the saved baseline and recovery dirty state when a write fails", async () => {
    const store = await import("./store");
    const before = store.getDataset();
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          new Response('{"error":"Disk full"}', { status: 500 }),
        ),
    );
    await expect(store.saveDocument("site.config.json", {})).rejects.toThrow(
      "Disk full",
    );
    expect(store.getDataset()).toBe(before);
    expect(store.getSessionChanges()).toEqual([]);
  });

  it("keeps a document visible after a failed deletion", async () => {
    const store = await import("./store");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("{}")));
    await store.saveDocument("photos/audit-test.json", []);
    const before = store.getDataset();
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          new Response('{"error":"Conflict"}', { status: 409 }),
        ),
    );
    await expect(
      store.deleteDocument("photos/audit-test.json"),
    ).rejects.toThrow("Conflict");
    expect(store.getDataset()).toBe(before);
  });

  it("rolls back completed writes without retaining the rejected draft", async () => {
    const store = await import("./store");
    const before = store.getDataset().photos;
    const fetchMock = vi.fn().mockResolvedValue(new Response("{}"));
    fetchMock.mockResolvedValueOnce(new Response("{}"));
    fetchMock.mockResolvedValueOnce(
      new Response('{"error":"Conflict"}', { status: 409 }),
    );
    vi.stubGlobal("fetch", fetchMock);
    await expect(
      store.applyWrites([
        { path: "photos/audit-first.json", value: [] },
        { path: "photos/audit-second.json", value: [] },
      ]),
    ).rejects.toThrow("Conflict");
    expect(store.getDataset().photos).toEqual(before);
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls[2][0]).toBe("/__data/delete");
  });
});
