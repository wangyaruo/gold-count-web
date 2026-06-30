import { resolve } from "node:path";
import type { ServerResponse } from "node:http";
import type { Connect } from "vite";
import { readLedgerDataFile, writeLedgerDataFile } from "./mockDataStore";
import type { LedgerData } from "../src/types";

const API_PATH = "/api/ledger-data";

function readRequestBody(req: Connect.IncomingMessage): Promise<string> {
  return new Promise((resolveBody, rejectBody) => {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => resolveBody(body));
    req.on("error", rejectBody);
  });
}

function sendJson(
  res: ServerResponse,
  statusCode: number,
  payload: unknown
): void {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

export function createMockApiMiddleware(
  dataFilePath = resolve(process.cwd(), "mock/ledger-data.json")
): Connect.NextHandleFunction {
  return async (req, res, next) => {
    if (!req.url?.startsWith(API_PATH)) {
      next();
      return;
    }

    try {
      if (req.method === "GET") {
        sendJson(res, 200, await readLedgerDataFile(dataFilePath));
        return;
      }

      if (req.method === "POST") {
        const body = await readRequestBody(req);
        const nextData = JSON.parse(body) as LedgerData;
        sendJson(res, 200, await writeLedgerDataFile(dataFilePath, nextData));
        return;
      }

      sendJson(res, 405, { message: "Method not allowed" });
    } catch {
      sendJson(res, 400, { message: "Invalid ledger data" });
    }
  };
}
