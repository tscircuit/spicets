import { expect, test } from "bun:test"
import { RawCard, parseSpiceCard, tokenizeSpice } from "lib"

test("unsupported preprocessor-style lines become tokenizer errors and raw cards", () => {
  const result = tokenizeSpice("#include vendor-models.inc")

  expect(result.errors).toHaveLength(1)
  expect(result.tokens[0]).toMatchObject({
    type: "error",
    raw: "#include vendor-models.inc",
  })
  expect(parseSpiceCard("#include vendor-models.inc")).toBeInstanceOf(RawCard)
})
