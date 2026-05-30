import { expect, test } from "bun:test"
import { parseToSpiceTokens, tokenizeSpice } from "lib"

test("parseToSpiceTokens aliases the tokenizer entrypoint", () => {
  expect(parseToSpiceTokens("R1 in out 10k")).toEqual(
    tokenizeSpice("R1 in out 10k"),
  )
})
