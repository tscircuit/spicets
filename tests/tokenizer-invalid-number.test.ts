import { test } from "bun:test"
import { strict as assert } from "node:assert"
import { tokenizeSpice } from "../lib/tokens/tokenizeSpice"

for (const malformed of ["1e+", "1e-", "-.5e+", "2.5E-"]) {
  for (const ending of ["", "; note\nR2 a b 2k", ")", ",2k"]) {
    test(`invalid number retains text: ${JSON.stringify(malformed + ending)}`, () => {
      const source = malformed + ending
      const result = tokenizeSpice(source, { preserveWhitespace: true })
      assert.equal(result.errors.length, 1)
      assert.equal(result.errors[0]!.raw, malformed)
      assert.equal(result.errors[0]!.range.end.offset, malformed.length)
      assert.equal(result.tokens[0]!.type, "error")
      assert.equal(result.tokens.map((token) => token.raw).join(""), source)
      for (const token of result.tokens) {
        assert.equal(
          source.slice(token.range.start.offset, token.range.end.offset),
          token.raw,
        )
        assert.ok(token.range.end.offset <= source.length)
      }
      if (ending.startsWith(";")) {
        assert.ok(result.tokens.some((token) => token.type === "comment"))
        const nextCard = result.tokens.find((token) => token.raw === "R2")!
        assert.equal(nextCard.range.start.line, 2)
        assert.equal(nextCard.range.start.column, 1)
      }
    })
  }
}

test("valid numbers retain values and existing suffix handling", () => {
  const result = tokenizeSpice("1e+2 1e-2 2k 1e", {
    preserveWhitespace: true,
  })
  assert.deepEqual(result.errors, [])
  assert.deepEqual(
    result.tokens
      .filter((token) => token.type === "number")
      .map((token) => token.value),
    [100, 0.01, 2000, 1],
  )
})

test("disabled number normalization and filtered trivia still recover", () => {
  const result = tokenizeSpice("1e+ ; note\n2k", {
    normalizeNumbers: false,
    preserveComments: false,
  })
  assert.equal(result.errors.length, 1)
  assert.deepEqual(
    result.tokens.map((token) => [token.type, token.raw]),
    [
      ["error", "1e+"],
      ["newline", "\n"],
      ["number", "2k"],
    ],
  )
})
