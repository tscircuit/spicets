import { expect, test } from "bun:test"
import { parseSpiceLibrary, tokenizeSpice } from "lib"

for (const source of [
  "1e+",
  "1e- R1 a 0 1k",
  ".param x=1e+)\nR1 a 0 1k",
  ".param x=1e+; comment\nR1 a 0 1k",
  ".param x=1e+\r\nR1 a 0 1k\r\n",
]) {
  test(`retains consumed malformed numeric text: ${JSON.stringify(source)}`, () => {
    const result = tokenizeSpice(source, { preserveWhitespace: true })
    expect(result.tokens.map((token) => token.raw).join("")).toBe(source)
    expect(result.errors).toHaveLength(1)
    const errorToken = result.tokens.find((token) => token.type === "error")
    expect(errorToken?.raw).toMatch(/^1e[+-]$/)
    expect(errorToken?.range).toEqual(result.errors[0]?.range)
    expect(errorToken?.raw).toBe(result.errors[0]?.raw)
    let offset = 0
    for (const token of result.tokens) {
      expect(token.range.start.offset).toBe(offset)
      offset = token.range.end.offset
      expect(source.slice(token.range.start.offset, offset)).toBe(token.raw)
    }
    expect(offset).toBe(source.length)
    expect(parseSpiceLibrary(source).toSource()).toBe(source)
    if (source.includes("R1")) {
      expect(result.tokens.find((token) => token.raw === "R1")?.type).toBe(
        "identifier",
      )
    }
  })
}

test("retains valid signed exponents", () => {
  const result = tokenizeSpice("1e+3 2e-3 .5E+2")
  expect(result.errors).toEqual([])
  expect(
    result.tokens.map((token) =>
      token.type === "number" ? token.value : null,
    ),
  ).toEqual([1000, 0.002, 50])
})
