import { test } from "bun:test"
import { strict as assert } from "node:assert"
import { tokenizeSpice } from "../lib/tokens/tokenizeSpice"

for (const newline of ["\n", "\r\n", "\r"]) {
  test(`line state advances for ${JSON.stringify(newline)}`, () => {
    const source = ["R1 a b 1k", "* note", "+ 2k", "R2 c d 2k"].join(newline)
    const result = tokenizeSpice(source, { preserveWhitespace: true })
    assert.deepEqual(result.errors, [])
    assert.equal(result.source.lineCount, 4)
    assert.equal(result.tokens.map((token) => token.raw).join(""), source)
    const comment = result.tokens.find((token) => token.type === "comment")!
    const continuation = result.tokens.find(
      (token) => token.type === "continuation",
    )!
    const second = result.tokens.find((token) => token.raw === "R2")!
    assert.equal(comment.range.start.line, 2)
    assert.equal(comment.range.start.column, 1)
    assert.equal(continuation.range.start.line, 3)
    assert.equal(second.range.start.line, 4)
    assert.equal(second.range.start.column, 1)
  })
}

test("mixed line endings count CRLF once and retain exact offsets", () => {
  const source = "a\rb\r\nc\nd\r"
  const result = tokenizeSpice(source)
  const identifiers = result.tokens.filter(
    (token) => token.type === "identifier",
  )
  assert.deepEqual(
    identifiers.map((token) => token.range.start),
    [
      { offset: 0, line: 1, column: 1 },
      { offset: 2, line: 2, column: 1 },
      { offset: 5, line: 3, column: 1 },
      { offset: 7, line: 4, column: 1 },
    ],
  )
  assert.equal(result.source.lineCount, 5)
})

test("indentation after CR still permits comments and continuation markers", () => {
  const result = tokenizeSpice("R1 a b 1k\r  * note\r\t+ 2k")
  const comment = result.tokens.find((token) => token.type === "comment")!
  const continuation = result.tokens.find(
    (token) => token.type === "continuation",
  )!
  assert.equal(comment.range.start.column, 3)
  assert.equal(comment.range.start.line, 2)
  assert.equal(continuation.range.start.column, 2)
  assert.equal(continuation.range.start.line, 3)
})
