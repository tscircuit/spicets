import { expect, test } from "bun:test"
import { tokenizeSpice, tokensToLogicalCards } from "lib"

test("groups token streams into logical cards", () => {
  const result = tokenizeSpice("R1 in out 10k\nC1 out 0 1u\n", {
    preserveWhitespace: true,
  })
  const cards = tokensToLogicalCards(result.tokens)

  expect(cards).toHaveLength(2)
  expect(cards[0]?.originalSource).toBe("R1 in out 10k")
  expect(cards[1]?.originalSource).toBe("C1 out 0 1u")
})
