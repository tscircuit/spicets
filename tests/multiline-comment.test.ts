import { test } from "bun:test"
import { strict as assert } from "node:assert"
import { Comment } from "../lib/trivia/Comment"
import { tokenizeSpice } from "../lib/tokens/tokenizeSpice"

for (const marker of ["*", ";", "$"] as const) {
  for (const ending of ["\n", "\r\n", "\r"]) {
    test(`multiline ${marker} comment retains ${JSON.stringify(ending)}`, () => {
      const text = `first${ending}R1 input 0 1k`
      const comment = new Comment(text, { marker })
      assert.equal(
        comment.toSource(),
        `${marker} first${ending}${marker} R1 input 0 1k`,
      )
      assert.equal(comment.text, text)
    })
  }
}

test("single-line formatting remains unchanged", () => {
  assert.equal(new Comment("note  ").toSource(), "* note")
})

test("preserve mode retains the supplied original source", () => {
  const comment = new Comment("one\ntwo", { originalSource: "* old" })
  assert.equal(comment.toSource(), "* old")
})

test("pretty mode regenerates every line of edited text", () => {
  const comment = new Comment("one\ntwo", { originalSource: "* old" })
  assert.equal(comment.toSource({ format: "pretty" }), "* one\n* two")
})

test("card-shaped text inside a comment remains comment trivia", () => {
  const source = new Comment("notes\nR1 input 0 1k").toSource()
  const result = tokenizeSpice(source)
  assert.deepEqual(result.errors, [])
  assert.deepEqual(
    result.tokens.map((token) => token.type),
    ["comment", "newline", "comment"],
  )
})
