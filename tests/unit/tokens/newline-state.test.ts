import { expect, test } from "bun:test"
import { parseSpiceLibrary, Resistor, tokenizeSpice } from "lib"

for (const newline of ["\r", "\n", "\r\n"]) {
  test(`recognizes comments and continuation after ${JSON.stringify(newline)}`, () => {
    const lines = ["R1 a b 1k", "+ temp=25", "  * comment", "R2 b 0 2k"]
    const source = lines.join(newline) + newline
    const result = tokenizeSpice(source, { preserveWhitespace: true })
    expect(result.errors).toEqual([])
    expect(result.source.lineCount).toBe(5)
    expect(result.tokens.map((token) => token.raw).join("")).toBe(source)
    expect(
      result.tokens.find((token) => token.type === "continuation"),
    ).toMatchObject({
      raw: "+",
      range: {
        start: {
          offset: lines[0]!.length + newline.length,
          line: 2,
          column: 1,
        },
      },
    })
    expect(
      result.tokens.find((token) => token.type === "comment"),
    ).toMatchObject({
      raw: "* comment",
      range: { start: { line: 3, column: 3 } },
    })
    expect(result.tokens.find((token) => token.raw === "R2")).toMatchObject({
      range: { start: { line: 4, column: 1 }, end: { line: 4, column: 3 } },
    })
    const library = parseSpiceLibrary(source)
    expect(library.cards).toHaveLength(3)
    expect(library.cards[0]).toBeInstanceOf(Resistor)
    expect(library.cards[0]?.toSource()).toBe(lines.slice(0, 2).join(newline))
    expect(library.toSource()).toBe(source)
  })

  test(`counts blank lines with ${JSON.stringify(newline)}`, () => {
    const result = tokenizeSpice(newline + newline + "R1 a 0 1k")
    expect(result.source.lineCount).toBe(3)
    expect(result.tokens[2]?.range.start).toEqual({
      offset: 2 * newline.length,
      line: 3,
      column: 1,
    })
  })
}

test("tracks mixed newline positions without counting CRLF twice", () => {
  const result = tokenizeSpice("A\rB\r\nC\nD")
  expect(result.source.lineCount).toBe(4)
  expect(
    result.tokens
      .filter((token) => token.type !== "newline")
      .map((token) => token.range.start),
  ).toEqual([
    { offset: 0, line: 1, column: 1 },
    { offset: 2, line: 2, column: 1 },
    { offset: 5, line: 3, column: 1 },
    { offset: 7, line: 4, column: 1 },
  ])
  expect(
    result.tokens
      .filter((token) => token.type === "newline")
      .map((token) => token.range.end),
  ).toEqual([
    { offset: 2, line: 2, column: 1 },
    { offset: 5, line: 3, column: 1 },
    { offset: 7, line: 4, column: 1 },
  ])
})
