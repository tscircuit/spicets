import { expect, test } from "bun:test"
import { tokenizeSpice } from "../../../lib/tokens/tokenizeSpice"

const numberValues = (source: string) =>
  tokenizeSpice(source)
    .tokens.filter((token) => token.type === "number")
    .map((token) => ({ raw: token.raw, value: token.value }))

// SPICE (ngspice/LTspice) accepts a scale suffix between digits as a decimal
// point: 4u7 == 4.7u, 1k2 == 1.2k. The tokenizer used to stop the number at
// the letter run, so "4u7" silently split into 4e-6 plus a stray number 7,
// corrupting the element value and the remaining card fields.

test("digits after a scale suffix extend the fraction", () => {
  const cases: Array<[string, string, number]> = [
    ["C1 1 0 4u7", "4u7", 4.7e-6],
    ["C1 1 0 3n3", "3n3", 3.3e-9],
    ["C1 1 0 2p2", "2p2", 2.2e-12],
    ["R1 1 0 1k2", "1k2", 1.2e3],
    ["R2 1 0 4meg7", "4meg7", 4.7e6],
    ["R3 1 0 1µ5", "1µ5", 1.5e-6],
  ]
  for (const [source, raw, expected] of cases) {
    const values = numberValues(source)
    const last = values.at(-1)!
    expect(last.raw).toBe(raw)
    expect(last.value).toBeCloseTo(expected, 15)
  }
})

test("a suffix-fraction number is a single token, not two numbers", () => {
  const values = numberValues("R1 1 0 4u7")
  expect(values.map((token) => token.raw)).toEqual(["1", "0", "4u7"])
})

test("plain suffix forms keep their value", () => {
  const cases: Array<[string, number]> = [
    ["C1 1 0 10uF", 10e-6],
    ["V1 1 0 5V", 5],
    ["R1 1 0 470", 470],
    ["R2 1 0 1e3", 1e3],
  ]
  for (const [source, expected] of cases) {
    expect(numberValues(source).at(-1)!.value).toBeCloseTo(expected, 15)
  }
})
