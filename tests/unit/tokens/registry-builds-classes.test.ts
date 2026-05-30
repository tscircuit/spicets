import { expect, test } from "bun:test"
import { Resistor, SpiceCard, tokenizeSpice, tokensToLogicalCards } from "lib"

test("registry builds classes from tokenized logical cards", () => {
  const result = tokenizeSpice("R1 in out 10k", { preserveWhitespace: true })
  const [card] = tokensToLogicalCards(result.tokens)

  expect(card).toBeDefined()
  const parsed = SpiceCard.parseSpiceTokens(card!)

  expect(parsed).toBeInstanceOf(Resistor)
  expect(parsed.toSource()).toBe("R1 in out 10k")
})
