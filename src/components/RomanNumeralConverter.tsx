"use client";

import { FormEvent, useState } from "react";

type Mode = "roman-to-arabic" | "arabic-to-roman";

const VALUES: Record<string, number> = {
  I: 1,
  V: 5,
  X: 10,
  L: 50,
  C: 100,
  D: 500,
  M: 1000,
};

const TOKENS = [
  [1000, "M"],
  [900, "CM"],
  [500, "D"],
  [400, "CD"],
  [100, "C"],
  [90, "XC"],
  [50, "L"],
  [40, "XL"],
  [10, "X"],
  [9, "IX"],
  [5, "V"],
  [4, "IV"],
  [1, "I"],
] as const;

type Conversion = {
  command: string;
  result: string;
  steps: string[];
  error?: string;
};

function encodeRoman(number: number) {
  let remaining = number;
  let roman = "";
  const steps: string[] = [];

  for (const [value, symbol] of TOKENS) {
    while (remaining >= value) {
      roman += symbol;
      remaining -= value;
      steps.push(`${symbol.padEnd(2)} = ${String(value).padStart(4)}  →  ${roman.padEnd(12)}  remainder ${remaining}`);
    }
  }

  return { roman, steps };
}

function decodeRoman(raw: string): Conversion {
  const roman = raw.trim().toUpperCase();
  if (!roman) {
    return { command: "roman → arabic", result: "", steps: [], error: "Enter a Roman numeral first." };
  }
  if (!/^[IVXLCDM]+$/.test(roman)) {
    return {
      command: `decode ${roman}`,
      result: "",
      steps: [],
      error: "Roman numerals can only contain I, V, X, L, C, D, and M.",
    };
  }

  let total = 0;
  const steps: string[] = [];
  for (let index = 0; index < roman.length; index += 1) {
    const symbol = roman[index];
    const value = VALUES[symbol];
    const nextSymbol = roman[index + 1];
    const nextValue = nextSymbol ? VALUES[nextSymbol] : 0;

    if (value < nextValue) {
      total -= value;
      steps.push(`${symbol} (${value}) < ${nextSymbol} (${nextValue})  →  subtract ${value}; total ${total}`);
    } else {
      total += value;
      steps.push(`${symbol} (${value})${nextSymbol ? ` ≥ ${nextSymbol} (${nextValue})` : " is last"}  →  add ${value}; total ${total}`);
    }
  }

  if (total < 1 || total > 3999) {
    return {
      command: `decode ${roman}`,
      result: "",
      steps,
      error: "This demo uses the conventional range from 1 through 3,999.",
    };
  }

  const canonical = encodeRoman(total).roman;
  if (canonical !== roman) {
    return {
      command: `decode ${roman}`,
      result: `${roman} is not in standard form. Did you mean ${canonical}?`,
      steps: [...steps, `Round-trip check: ${total} converts back to ${canonical}, not ${roman}.`],
      error: "The value can be read, but the original numeral is not canonical.",
    };
  }

  return {
    command: `decode ${roman}`,
    result: `${roman} = ${total.toLocaleString()}`,
    steps: [...steps, `Round-trip check: ${total} converts back to ${canonical}. Valid.`],
  };
}

function convertArabic(raw: string): Conversion {
  const trimmed = raw.trim();
  const number = Number(trimmed);
  if (!trimmed || !Number.isInteger(number) || number < 1 || number > 3999) {
    return {
      command: "arabic → roman",
      result: "",
      steps: [],
      error: "Enter a whole number from 1 through 3,999.",
    };
  }

  const { roman, steps } = encodeRoman(number);
  return {
    command: `encode ${number}`,
    result: `${number.toLocaleString()} = ${roman}`,
    steps,
  };
}

const EXAMPLES: Record<Mode, string[]> = {
  "roman-to-arabic": ["XLII", "MCMXCIV", "MMXXVI"],
  "arabic-to-roman": ["42", "1994", "2026"],
};

export function RomanNumeralConverter() {
  const [mode, setMode] = useState<Mode>("roman-to-arabic");
  const [input, setInput] = useState("MMXXVI");
  const [conversion, setConversion] = useState<Conversion | null>(null);

  function changeMode(nextMode: Mode) {
    setMode(nextMode);
    setInput(nextMode === "roman-to-arabic" ? "MMXXVI" : "2026");
    setConversion(null);
  }

  function runConversion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setConversion(mode === "roman-to-arabic" ? decodeRoman(input) : convertArabic(input));
  }

  return (
    <section className="mt-14 md:mt-20" aria-labelledby="roman-converter-heading">
      <div className="mx-auto w-full max-w-3xl px-5 sm:px-8">
        <h2 id="roman-converter-heading" className="text-2xl font-semibold tracking-tight text-fg">
          Try the converter
        </h2>
        <p className="mt-3 text-base leading-relaxed text-fg-muted">
          Convert in either direction, then open the trace to see exactly how the answer was built.
        </p>

        <div className="mt-6 border-y border-border-default py-7">
          <fieldset>
            <legend className="text-base font-semibold text-fg">Conversion direction</legend>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:gap-7">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-fg">
                <input
                  type="radio"
                  name="roman-conversion-direction"
                  value="roman-to-arabic"
                  checked={mode === "roman-to-arabic"}
                  onChange={() => changeMode("roman-to-arabic")}
                  className="size-4 accent-[var(--accent)]"
                />
                Roman numeral to number
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-fg">
                <input
                  type="radio"
                  name="roman-conversion-direction"
                  value="arabic-to-roman"
                  checked={mode === "arabic-to-roman"}
                  onChange={() => changeMode("arabic-to-roman")}
                  className="size-4 accent-[var(--accent)]"
                />
                Number to Roman numeral
              </label>
            </div>
          </fieldset>

          <form onSubmit={runConversion} className="mt-7">
              <label htmlFor="roman-converter-input" className="block text-sm font-medium text-fg">
                {mode === "roman-to-arabic" ? "Roman numeral" : "Arabic number"}
              </label>
              <p id="roman-converter-hint" className="mt-1 text-sm text-fg-muted">
                {mode === "roman-to-arabic"
                  ? "Use I, V, X, L, C, D, and M."
                  : "Enter a whole number from 1 through 3,999."}
              </p>
              <div className="mt-3 flex max-w-xl flex-col gap-3 sm:flex-row">
                <input
                  id="roman-converter-input"
                  aria-describedby={`roman-converter-hint${conversion?.error ? " roman-converter-error" : ""}`}
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  autoComplete="off"
                  spellCheck={false}
                  inputMode={mode === "arabic-to-roman" ? "numeric" : "text"}
                  className="min-h-12 min-w-0 flex-1 rounded-md border border-border-control bg-bg px-4 font-mono text-lg uppercase text-fg"
                  placeholder={mode === "roman-to-arabic" ? "MCMXCIV" : "1994"}
                />
                <button type="submit" className="btn btn-primary h-12">
                  Convert
                </button>
              </div>
          </form>

          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-fg-muted">
              <span>Try an example:</span>
              {EXAMPLES[mode].map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => {
                    setInput(example);
                    setConversion(mode === "roman-to-arabic" ? decodeRoman(example) : convertArabic(example));
                  }}
                  className="link border-0 bg-transparent p-0 font-mono"
                >
                  {example}
                </button>
              ))}
          </div>

          <div className="mt-7 border-l-2 border-accent pl-4" role="status" aria-live="polite">
              {conversion ? (
                <>
                  <p className="text-sm text-fg-muted">Result</p>
                  {conversion.result ? <p className="mt-1 font-mono text-xl font-semibold text-fg">{conversion.result}</p> : null}
                  {conversion.error ? <p id="roman-converter-error" className="mt-1 font-medium text-fg">{conversion.error}</p> : null}
                  {conversion.steps.length > 0 ? (
                    <details className="mt-5 border-t border-border-default pt-4" open>
                      <summary className="cursor-pointer text-sm font-medium text-fg">
                        Show the calculation ({conversion.steps.length} steps)
                      </summary>
                      <ol className="mt-3 space-y-1 font-mono text-sm leading-6 text-fg-muted">
                        {conversion.steps.map((step, index) => <li key={`${index}-${step}`}>{String(index + 1).padStart(2, "0")}. {step}</li>)}
                      </ol>
                    </details>
                  ) : null}
                </>
              ) : (
                <p className="text-fg-muted">Your result will appear here.</p>
              )}
          </div>
        </div>
      </div>
    </section>
  );
}
