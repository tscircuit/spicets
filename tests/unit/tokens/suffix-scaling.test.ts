import { expect, test } from "bun:test"
import { tokenizeSpice } from "../../../lib/tokens/tokenizeSpice"

const numberValues = (source: string) =>
  tokenizeSpice(source)
    .tokens.filter((token) => token.type === "number")
    .map((token) => ({ raw: token.raw, value: token.value }))

// SPICE reads a numeric suffix as the longest known scale prefix and
// ignores trailing unit letters. The tokenizer used to treat the whole
// letter run as the suffix, so "10uF" silently parsed as 10 instead of 1e-5.

test("unit letters after a known suffix are ignored", () => {
  const cases: Array<[string, number]> = [
    ["C1 1 0 10uF", 10e-6],
    ["C1 1 0 100nF", 100e-9],
    ["C1 1 0 22pF", 22e-12],
    ["R1 1 0 4.7kohm", 4.7e3],
    ["R2 1 0 1megohm", 1e6],
    ["L1 1 0 2.2mH", 2.2e-3],
  ]
  for (const [source, expected] of cases) {
    const last = numberValues(source).at(-1)!
    expect(last.value).toBeCloseTo(expected, 15)
  }
})

test("micro signs µ (U+00B5) and μ (U+03BC) alias the u suffix", () => {
  for (const source of ["C1 1 0 10µ", "C1 1 0 10μ", "C1 1 0 10µF"]) {
    const tokens = tokenizeSpice(source).tokens
    const last = tokens.filter((token) => token.type === "number").at(-1)!
    expect(last.value).toBeCloseTo(10e-6, 15)
    // The micro sign stays inside the number token; no stray identifier.
    expect(
      tokens.some(
        (token) => token.type === "identifier" && /[µμ]/.test(token.raw),
      ),
    ).toBe(false)
  }
})

test("plain suffixes keep their existing values", () => {
  const cases: Array<[string, number]> = [
    ["R1 1 0 10k", 10e3],
    ["R1 1 0 1meg", 1e6],
    ["R1 1 0 1MEG", 1e6],
    ["C1 1 0 10u", 10e-6],
    ["R1 1 0 2.2kk", 2.2e3], // trailing letters ignored, per SPICE
  ]
  for (const [source, expected] of cases) {
    expect(numberValues(source).at(-1)!.value).toBeCloseTo(expected, 15)
  }
})

test("unknown suffixes keep the lenient x1 behavior and raw is preserved", () => {
  const last = numberValues("V1 1 0 5V").at(-1)!
  expect(last.value).toBe(5)
  expect(last.raw).toBe("5V")
  const micro = numberValues("C1 1 0 10µF").at(-1)!
  expect(micro.raw).toBe("10µF")
})

test("normalizeNumbers: false still yields null values", () => {
  const result = tokenizeSpice("C1 1 0 10uF", { normalizeNumbers: false })
  const last = result.tokens.filter((token) => token.type === "number").at(-1)!
  expect(last.value).toBeNull()
  expect(last.raw).toBe("10uF")
})
