import { expect, test } from "bun:test"
import {
  Model,
  parseSpiceCards,
  tokenizeSpice,
  tokensToLogicalCards,
} from "lib"

for (const eol of ["\n", "\r\n"]) {
  for (const indent of [" ", "\t", "  \t"]) {
    test(`joins an indented continuation ${JSON.stringify({ eol, indent })}`, () => {
      const source = `.model DM D (IS=1n${eol}${indent}+ N=2${eol}${indent}+ RS=3)`
      const tokenized = tokenizeSpice(source, { preserveWhitespace: true })
      expect(
        tokenized.tokens.filter((t) => t.type === "continuation"),
      ).toHaveLength(2)
      const logical = tokensToLogicalCards(tokenized.tokens)
      expect(logical).toHaveLength(1)
      expect(logical[0]?.originalSource).toBe(source)
      const cards = parseSpiceCards(source)
      expect(cards).toHaveLength(1)
      expect((cards[0] as Model).params.getString()).toBe("IS=1n N=2 RS=3")
      expect(cards[0]?.toSource()).toBe(source)
    })
  }
}

test("indented ordinary and blank lines stay separate", () => {
  const source = ".param a=1\n  .param b=2\n  \n\t.param c=3"
  const cards = tokensToLogicalCards(
    tokenizeSpice(source, { preserveWhitespace: true }).tokens,
  )
  expect(cards.map((card) => card.originalSource)).toEqual([
    ".param a=1",
    "  .param b=2",
    "  ",
    "\t.param c=3",
  ])
})
