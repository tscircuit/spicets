import { expect, test } from "bun:test"
import { tokenizeSpice } from "lib"

for (const [raw, expected] of [
  ["10kOhm", 10000],
  ["2MEGohm", 2000000],
  ["3mA", 0.003],
  ["4us", 0.000004],
  ["5nF", 5e-9],
  ["6pF", 6e-12],
  ["7GHz", 7e9],
  ["2mil", 50.8e-6],
  ["2MILinch", 50.8e-6],
  ["-1.5e2kOhm", -150000],
  ["10M", 0.01],
  ["10Meg", 1e7],
  ["10Ohm", 10],
  ["10Volt", 10],
  ["10", 10],
] as const) {
  test(`normalizes SPICE numeric suffix ${raw}`, () => {
    const result = tokenizeSpice(raw)
    expect(result.errors).toEqual([])
    expect(result.tokens).toHaveLength(1)
    const token = result.tokens[0]!
    expect(token.type).toBe("number")
    if (token.type !== "number") throw new Error("Expected number token")
    expect(token.raw).toBe(raw)
    expect(token.value! / expected).toBeCloseTo(1, 12)
  })
}

test("keeps raw suffix and source ranges while normalizing a netlist", () => {
  const source = "R1 in 0 10kOhm\nC1 in 0 4uF\n"
  const { tokens } = tokenizeSpice(source, { preserveWhitespace: true })
  expect(tokens.map((token) => token.raw).join("")).toBe(source)
  const token = tokens.find((token) => token.raw === "10kOhm")!
  expect(token.type).toBe("number")
  if (token.type !== "number") throw new Error("Expected number token")
  expect(token.unitSuffix).toBe("kOhm")
  expect(token.value).toBe(10000)
  expect(source.slice(token.range.start.offset, token.range.end.offset)).toBe(
    "10kOhm",
  )
})

test("normalizeNumbers false leaves values unevaluated", () => {
  const result = tokenizeSpice("10kOhm", { normalizeNumbers: false })
  expect(result.tokens[0]).toMatchObject({
    type: "number",
    raw: "10kOhm",
    unitSuffix: "kOhm",
    value: null,
  })
})
