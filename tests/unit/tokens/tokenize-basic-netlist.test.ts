import { expect, test } from "bun:test"
import { tokenizeSpice } from "lib"

test("tokenizes SPICE source with comments, directives, identifiers, and numbers", () => {
  const result = tokenizeSpice("* RC\nVin in 0 DC 5\n.tran 1ms 100ms\n", {
    preserveWhitespace: false,
  })

  expect(result.errors).toEqual([])
  expect(result.tokens.map((token) => token.type)).toEqual([
    "comment",
    "newline",
    "identifier",
    "identifier",
    "number",
    "identifier",
    "number",
    "newline",
    "directive",
    "number",
    "number",
    "newline",
  ])
  expect(result.tokens[0]).toMatchObject({
    type: "comment",
    raw: "* RC",
    value: "RC",
    marker: "*",
  })
  expect(result.tokens[8]).toMatchObject({
    type: "directive",
    raw: ".tran",
    value: "tran",
  })
})
