import { expect, test } from "bun:test"
import { tokenizeSpice } from "lib"

for (const source of [
  "V1 in 0 -5",
  "V1 in 0 +5",
  "PWL(0 -1 1u +.5 2u -2e-3)",
  ".param values=1\t-2\t+3",
]) {
  test(`whitespace filtering retains signed numbers: ${source}`, () => {
    const preserved = tokenizeSpice(source, { preserveWhitespace: true })
    const filtered = tokenizeSpice(source)
    expect(filtered.errors).toEqual([])
    expect(filtered.tokens).toEqual(
      preserved.tokens.filter((token) => token.type !== "whitespace"),
    )
    const signed = filtered.tokens.filter(
      (token) => token.type === "number" && /^[+-]/.test(token.raw),
    )
    expect(signed.length).toBeGreaterThan(0)
    for (const token of filtered.tokens) {
      expect(
        source.slice(token.range.start.offset, token.range.end.offset),
      ).toBe(token.raw)
    }
  })
}

test("keeps unspaced binary operators separate and unary signs attached", () => {
  const tokens = tokenizeSpice("1-2+3*(-4)").tokens
  expect(tokens.map((token) => [token.type, token.raw])).toEqual([
    ["number", "1"],
    ["operator", "-"],
    ["number", "2"],
    ["operator", "+"],
    ["number", "3"],
    ["operator", "*"],
    ["punctuation", "("],
    ["number", "-4"],
    ["punctuation", ")"],
  ])
})

test("preserves normalization opt-out for signed values", () => {
  const token = tokenizeSpice("V1 in 0 -5", {
    normalizeNumbers: false,
  }).tokens.at(-1)
  expect(token).toMatchObject({ type: "number", raw: "-5", value: null })
})
