import { expect, test } from "bun:test"
import { VoltageSource, parseSpiceCard, tokenizeSpice } from "lib"

test("tokenizes signed numbers as one number token", () => {
  const result = tokenizeSpice("V1 in 0 DC -5\nR1 in out 1e-3", {
    preserveWhitespace: true,
  })
  const numbers = result.tokens.filter((token) => token.type === "number")

  expect(numbers.map((token) => token.raw)).toContain("-5")
  expect(numbers.map((token) => token.raw)).toContain("1e-3")
})

test("parses signed source values without dropping the magnitude", () => {
  const card = parseSpiceCard("V1 in 0 DC -5")

  expect(card).toBeInstanceOf(VoltageSource)
  expect((card as VoltageSource).dc?.getString()).toBe("-5")
  expect(card.toSource({ format: "pretty" })).toBe("V1 in 0 DC -5")
})
