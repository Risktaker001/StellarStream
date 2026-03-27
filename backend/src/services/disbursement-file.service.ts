import { StrKey } from "@stellar/stellar-sdk";

export interface RawRecipientRow {
  address: string;
  amount: string;
  [key: string]: string;
}

export interface CleanRecipient {
  address: string;
  amountStroops: string;
}

export interface ProcessFileResult {
  valid: CleanRecipient[];
  errors: { row: number; address: string; reason: string }[];
  totalRows: number;
}

const STROOPS_PER_UNIT = 10_000_000n;

function toStroops(amount: string): bigint {
  const trimmed = amount.trim();
  const dotIndex = trimmed.indexOf(".");
  if (dotIndex === -1) {
    return BigInt(trimmed) * STROOPS_PER_UNIT;
  }
  const intPart = trimmed.slice(0, dotIndex);
  const fracPart = trimmed.slice(dotIndex + 1).padEnd(7, "0").slice(0, 7);
  return BigInt(intPart) * STROOPS_PER_UNIT + BigInt(fracPart);
}

function parseCsv(raw: string): RawRecipientRow[] {
  const lines = raw.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  return lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim());
    return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? ""])) as RawRecipientRow;
  });
}

export function processRows(rows: RawRecipientRow[]): ProcessFileResult {
  const valid: CleanRecipient[] = [];
  const errors: ProcessFileResult["errors"] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const address = (row.address ?? "").trim();
    const amountRaw = (row.amount ?? "").trim();
    const rowNum = i + 1;

    if (!StrKey.isValidEd25519PublicKey(address)) {
      errors.push({ row: rowNum, address, reason: "Invalid G-address checksum" });
      continue;
    }

    if (!/^\d+(\.\d+)?$/.test(amountRaw)) {
      errors.push({ row: rowNum, address, reason: "Invalid amount format" });
      continue;
    }

    try {
      const amountStroops = toStroops(amountRaw).toString();
      valid.push({ address, amountStroops });
    } catch {
      errors.push({ row: rowNum, address, reason: "Amount conversion failed" });
    }
  }

  return { valid, errors, totalRows: rows.length };
}

export function processFile(
  content: string,
  format: "csv" | "json"
): ProcessFileResult {
  let rows: RawRecipientRow[];

  if (format === "csv") {
    rows = parseCsv(content);
  } else {
    const parsed = JSON.parse(content) as RawRecipientRow[];
    if (!Array.isArray(parsed)) throw new Error("JSON input must be an array");
    rows = parsed;
  }

  return processRows(rows);
}
