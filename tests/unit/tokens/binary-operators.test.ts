import { expect, test } from "bun:test"
import { tokenizeSpice } from "lib"

test("tokenizes binary plus and minus as operators", () => {
  const result = tokenizeSpice(".param x=1+2 y=1-2", {
    preserveWhitespace: true,
  })
  const significant = result.tokens.filter((token) => token.type !== "whitespace")

  expect(significant.map((token) => token.raw)).toEqual([
    ".param",
    "x",
    "=",
    "1",
    "+",
    "2",
    "y",
    "=",
    "1",
    "-",
    "2",
  ])
  expect(significant.map((token) => token.type)).toEqual([
    "directive",
    "identifier",
    "operator",
    "number",
    "operator",
    "number",
    "identifier",
    "operator",
    "number",
    "operator",
    "number",
  ])
})
