import { parseISO, formatISO } from "date-fns";
import OpenAI from "openai";
import { PDFParse } from "pdf-parse";
import type { ExtractedContractDates } from "@/types/contract";

const datePattern =
  /\b(?:\d{4}-\d{2}-\d{2}|\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{1,2},?\s+\d{4})\b/gi;

function normalizeDate(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const parsed = parseISO(value);
  if (!Number.isNaN(parsed.getTime())) {
    return formatISO(parsed, { representation: "date" });
  }

  const fallback = new Date(value);
  if (Number.isNaN(fallback.getTime())) {
    return null;
  }

  return formatISO(fallback, { representation: "date" });
}

function heuristicParse(text: string): ExtractedContractDates {
  const normalized = text.replace(/\s+/g, " ");
  const matches = [...normalized.matchAll(datePattern)].map((entry) => entry[0]);

  const renewalLine = normalized.match(/(?:renewal|renews?|term ends?|expiration)[^\.\n]{0,120}/i)?.[0] ?? "";
  const cancellationLine = normalized.match(/(?:cancel(?:lation)?|termination notice|opt-out)[^\.\n]{0,120}/i)?.[0] ?? "";
  const paymentLine = normalized.match(/(?:payment due|invoice due|billing date)[^\.\n]{0,120}/i)?.[0] ?? "";

  const renewalDate = normalizeDate(renewalLine.match(datePattern)?.[0] ?? matches[0] ?? null);
  const cancellationDate = normalizeDate(cancellationLine.match(datePattern)?.[0] ?? matches[1] ?? null);
  const paymentDate = normalizeDate(paymentLine.match(datePattern)?.[0] ?? matches[2] ?? null);

  return {
    renewalDate,
    cancellationDate,
    paymentDate,
    summary:
      "AI extraction is unavailable, so heuristic parsing was used. Verify the dates before relying on reminders.",
    confidence: 0.48,
    keyClauses: [renewalLine, cancellationLine, paymentLine].filter(Boolean)
  };
}

async function parseWithAI(text: string): Promise<ExtractedContractDates | null> {
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const prompt = [
    "Extract contract deadlines from this contract text.",
    "Return strict JSON with keys: renewalDate, cancellationDate, paymentDate, summary, confidence, keyClauses.",
    "Dates must be ISO YYYY-MM-DD or null if unknown.",
    "confidence must be a number between 0 and 1. keyClauses should include exact short clauses supporting each date."
  ].join(" ");

  const response = await client.responses.create({
    model: "gpt-4o-mini",
    input: [
      {
        role: "system",
        content: "You are a contract analyst. Be accurate and conservative with unknown dates."
      },
      {
        role: "user",
        content: `${prompt}\n\n${text.slice(0, 25000)}`
      }
    ]
  });

  const outputText =
    (response as unknown as { output_text?: string }).output_text ||
    (response.output?.[0] as { content?: Array<{ text?: string }> } | undefined)?.content?.[0]?.text;

  if (!outputText) {
    return null;
  }

  const parsed = JSON.parse(outputText) as Partial<ExtractedContractDates>;

  return {
    renewalDate: normalizeDate(parsed.renewalDate),
    cancellationDate: normalizeDate(parsed.cancellationDate),
    paymentDate: normalizeDate(parsed.paymentDate),
    summary: parsed.summary || "Contract deadlines extracted with AI.",
    confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0.72,
    keyClauses: Array.isArray(parsed.keyClauses)
      ? parsed.keyClauses.filter((entry): entry is string => typeof entry === "string")
      : []
  };
}

export async function extractTextFromFile(file: File) {
  const bytes = Buffer.from(await file.arrayBuffer());

  if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
    const parser = new PDFParse({ data: bytes });
    const parsed = await parser.getText();
    await parser.destroy();
    return parsed.text || "";
  }

  return bytes.toString("utf-8");
}

export async function parseContractFromText(text: string): Promise<ExtractedContractDates> {
  const aiExtraction = await parseWithAI(text).catch(() => null);
  if (aiExtraction) {
    return aiExtraction;
  }

  return heuristicParse(text);
}

export async function parseContractFile(file: File): Promise<{
  text: string;
  extracted: ExtractedContractDates;
}> {
  const text = await extractTextFromFile(file);
  const extracted = await parseContractFromText(text);
  return { text, extracted };
}
