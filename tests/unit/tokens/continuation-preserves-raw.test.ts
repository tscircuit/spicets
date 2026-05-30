import { expect, test } from "bun:test"
import { tokenizeSpice, tokensToLogicalCards } from "lib"

test("continuation logical cards preserve exact raw source", () => {
  const result = tokenizeSpice("R1 in out 10k\n+ temp=25\n", {
    preserveWhitespace: true,
  })
  const [card] = tokensToLogicalCards(result.tokens)

  expect(card?.originalSource).toBe("R1 in out 10k\n+ temp=25")
  expect(card?.tokens.some((token) => token.type === "continuation" && token.raw === "+")).toBe(true)
})
