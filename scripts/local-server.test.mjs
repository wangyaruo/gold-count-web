import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createLocalServer } from "./local-server.mjs";

let tempDir = "";
let distDir = "";
let dataFilePath = "";
let marketSnapshotFetcher;
let server;
let baseUrl = "";

async function startServer() {
  server = createLocalServer({ dataFilePath, distDir, marketSnapshotFetcher });
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      server.off("error", reject);
      resolve();
    });
  });

  const address = server.address();
  baseUrl = `http://127.0.0.1:${address.port}`;
}

describe("local production server", () => {
  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), "gold-ledger-local-server-"));
    distDir = join(tempDir, "dist");
    dataFilePath = join(tempDir, "mock", "ledger-data.json");
    marketSnapshotFetcher = undefined;
    await mkdir(distDir, { recursive: true });
    await writeFile(join(tempDir, "placeholder"), "", "utf8");
  });

  afterEach(async () => {
    if (server) {
      await new Promise((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      });
      server = undefined;
    }

    await rm(tempDir, { force: true, recursive: true });
  });

  it("serves the built index for root and nested routes", async () => {
    await writeFile(join(distDir, "index.html"), "<h1>黄金小账本</h1>", {
      encoding: "utf8",
      flag: "w"
    });
    await startServer();

    const rootResponse = await fetch(`${baseUrl}/`);
    const nestedResponse = await fetch(`${baseUrl}/transactions/today`);

    expect(rootResponse.status).toBe(200);
    expect(await rootResponse.text()).toContain("黄金小账本");
    expect(nestedResponse.status).toBe(200);
    expect(await nestedResponse.text()).toContain("黄金小账本");
  });

  it("persists ledger data through the API", async () => {
    await writeFile(join(distDir, "index.html"), "<h1>App</h1>", {
      encoding: "utf8",
      flag: "w"
    });
    await startServer();

    const nextData = {
      currentGoldPrice: 588.5,
      transactionFilter: "all",
      transactions: [
        {
          id: "buy-1",
          type: "buy",
          date: "2026-07-01",
          grams: 10,
          unitPrice: 520,
          amount: 5200,
          note: "金条"
        }
      ]
    };

    const saveResponse = await fetch(`${baseUrl}/api/ledger-data`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nextData)
    });
    const loadResponse = await fetch(`${baseUrl}/api/ledger-data`);

    expect(saveResponse.status).toBe(200);
    expect(await saveResponse.json()).toEqual(nextData);
    expect(loadResponse.status).toBe(200);
    expect(await loadResponse.json()).toEqual(nextData);
    expect(JSON.parse(await readFile(dataFilePath, "utf8"))).toEqual(nextData);
  });

  it("returns default ledger data when the data file is missing", async () => {
    await writeFile(join(distDir, "index.html"), "<h1>App</h1>", {
      encoding: "utf8",
      flag: "w"
    });
    await startServer();

    const response = await fetch(`${baseUrl}/api/ledger-data`);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      currentGoldPrice: 0,
      transactionFilter: "all",
      transactions: []
    });
  });

  it("serves the current gold price from the market snapshot source", async () => {
    await writeFile(join(distDir, "index.html"), "<h1>App</h1>", {
      encoding: "utf8",
      flag: "w"
    });
    marketSnapshotFetcher = async () => ({
      price: {
        display_value: 870.65,
        display_unit: "CNY/g",
        source: "工商银行积存金",
        timestamp: "2026-07-01T03:13:39+00:00"
      }
    });
    await startServer();

    const response = await fetch(`${baseUrl}/api/current-gold-price`);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      price: 870.65,
      unit: "CNY/g",
      source: "工商银行积存金",
      timestamp: "2026-07-01T03:13:39+00:00"
    });
  });
});
