import { createServer } from "node:http";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { dirname, extname, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { spawn } from "node:child_process";

const API_PATH = "/api/ledger-data";
const DEFAULT_PORT = 4173;
const DEFAULT_HOST = "127.0.0.1";
const MAX_BODY_SIZE = 1024 * 1024;

const defaultLedgerData = {
  currentGoldPrice: 0,
  transactionFilter: "all",
  transactions: []
};

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp"
};

function isValidTransactionFilter(value) {
  return value === "all" || value === "buy" || value === "sell";
}

function normalizeLedgerData(value) {
  if (!value || typeof value !== "object") {
    return null;
  }

  if (
    typeof value.currentGoldPrice !== "number" ||
    !Number.isFinite(value.currentGoldPrice) ||
    value.currentGoldPrice < 0 ||
    !isValidTransactionFilter(value.transactionFilter) ||
    !Array.isArray(value.transactions)
  ) {
    return null;
  }

  const transactions = value.transactions.map((transaction) => {
    if (!transaction || typeof transaction !== "object") {
      return null;
    }

    const amount = transaction.amount ?? transaction.fee;
    if (
      typeof transaction.id !== "string" ||
      (transaction.type !== "buy" && transaction.type !== "sell") ||
      typeof transaction.date !== "string" ||
      typeof transaction.grams !== "number" ||
      typeof transaction.unitPrice !== "number" ||
      typeof amount !== "number" ||
      typeof transaction.note !== "string"
    ) {
      return null;
    }

    return {
      id: transaction.id,
      type: transaction.type,
      date: transaction.date,
      grams: transaction.grams,
      unitPrice: transaction.unitPrice,
      amount,
      note: transaction.note
    };
  });

  if (transactions.some((transaction) => transaction === null)) {
    return null;
  }

  return {
    currentGoldPrice: value.currentGoldPrice,
    transactionFilter: value.transactionFilter,
    transactions
  };
}

async function readLedgerDataFile(filePath) {
  try {
    const raw = await readFile(filePath, "utf8");
    return normalizeLedgerData(JSON.parse(raw)) ?? defaultLedgerData;
  } catch {
    return defaultLedgerData;
  }
}

async function writeLedgerDataFile(filePath, data) {
  const nextData = normalizeLedgerData(data) ?? defaultLedgerData;
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(nextData, null, 2)}\n`, "utf8");
  return nextData;
}

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

function sendText(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.end(payload);
}

function readRequestBody(req) {
  return new Promise((resolveBody, rejectBody) => {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
      if (body.length > MAX_BODY_SIZE) {
        rejectBody(new Error("Request body is too large"));
        req.destroy();
      }
    });
    req.on("end", () => resolveBody(body));
    req.on("error", rejectBody);
  });
}

function resolveStaticPath(distDir, pathname) {
  const distRoot = resolve(distDir);
  const requestedPath = pathname === "/" ? "/index.html" : pathname;
  const decodedPath = decodeURIComponent(requestedPath);
  const filePath = resolve(distRoot, `.${decodedPath}`);
  const insideDist = filePath === distRoot || filePath.startsWith(`${distRoot}${sep}`);

  return insideDist ? filePath : null;
}

async function isFile(filePath) {
  try {
    return (await stat(filePath)).isFile();
  } catch {
    return false;
  }
}

async function serveStaticFile(req, res, distDir, pathname) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    sendJson(res, 405, { message: "Method not allowed" });
    return;
  }

  const filePath = resolveStaticPath(distDir, pathname);
  if (!filePath) {
    sendText(res, 403, "Forbidden");
    return;
  }

  let targetPath = filePath;
  if (!(await isFile(targetPath))) {
    if (extname(pathname)) {
      sendText(res, 404, "Not found");
      return;
    }

    targetPath = resolve(distDir, "index.html");
  }

  if (!(await isFile(targetPath))) {
    sendText(res, 404, "Build output not found. Run npm run build first.");
    return;
  }

  const contentType = contentTypes[extname(targetPath)] ?? "application/octet-stream";
  const content = await readFile(targetPath);

  res.statusCode = 200;
  res.setHeader("Content-Type", contentType);
  if (req.method === "HEAD") {
    res.end();
    return;
  }

  res.end(content);
}

async function handleLedgerApi(req, res, dataFilePath) {
  if (req.method === "GET") {
    sendJson(res, 200, await readLedgerDataFile(dataFilePath));
    return;
  }

  if (req.method === "POST") {
    try {
      const body = await readRequestBody(req);
      const nextData = JSON.parse(body);
      sendJson(res, 200, await writeLedgerDataFile(dataFilePath, nextData));
    } catch {
      sendJson(res, 400, { message: "Invalid ledger data" });
    }
    return;
  }

  sendJson(res, 405, { message: "Method not allowed" });
}

export function createLocalServer({
  dataFilePath = resolve(process.cwd(), "mock/ledger-data.json"),
  distDir = resolve(process.cwd(), "dist")
} = {}) {
  return createServer(async (req, res) => {
    const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);

    try {
      if (url.pathname === API_PATH) {
        await handleLedgerApi(req, res, dataFilePath);
        return;
      }

      await serveStaticFile(req, res, distDir, url.pathname);
    } catch {
      sendJson(res, 500, { message: "Local server error" });
    }
  });
}

function listen(server, port, host) {
  return new Promise((resolveListen, rejectListen) => {
    server.once("error", rejectListen);
    server.listen(port, host, () => {
      server.off("error", rejectListen);
      resolveListen();
    });
  });
}

function openUrl(url) {
  const child = spawn("open", [url], {
    detached: true,
    stdio: "ignore"
  });
  child.unref();
}

export async function startLocalServer({
  dataFilePath,
  distDir,
  host = process.env.GOLD_LEDGER_HOST ?? DEFAULT_HOST,
  openBrowser = false,
  port = Number(process.env.GOLD_LEDGER_PORT ?? process.env.PORT ?? DEFAULT_PORT),
  portAttempts = 20
} = {}) {
  for (let offset = 0; offset < portAttempts; offset += 1) {
    const nextPort = port + offset;
    const server = createLocalServer({ dataFilePath, distDir });

    try {
      await listen(server, nextPort, host);
      const url = `http://${host}:${nextPort}/`;

      if (openBrowser) {
        openUrl(url);
      }

      return { host, port: nextPort, server, url };
    } catch (error) {
      try {
        server.close();
      } catch {
        // Ignore close errors for failed listen attempts.
      }

      if (error?.code === "EADDRINUSE") {
        continue;
      }

      throw error;
    }
  }

  throw new Error(`No available port found from ${port} to ${port + portAttempts - 1}`);
}

async function runCli() {
  const openBrowser = process.argv.includes("--open");
  const { url } = await startLocalServer({ openBrowser });

  console.log(`黄金小账本本地服务已启动：${url}`);
  console.log("数据文件：mock/ledger-data.json");
  console.log("按 Ctrl+C 停止服务。");
}

const currentFilePath = fileURLToPath(import.meta.url);
const entryFilePath = process.argv[1] ? fileURLToPath(pathToFileURL(process.argv[1])) : "";

if (currentFilePath === entryFilePath) {
  runCli().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
