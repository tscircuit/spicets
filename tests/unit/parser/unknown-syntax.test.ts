import { expect, test } from "bun:test"
import { RawCard, UnknownDotCommand, parseSpiceCards } from "lib"

test("preserves unknown syntax as specific raw or unknown cards", () => {
  const [raw, unknown] = parseSpiceCards("#include vendor-models.inc\n.foo bar")

  expect(raw).toBeInstanceOf(RawCard)
  expect(raw?.toSource()).toBe("#include vendor-models.inc")
  expect(unknown).toBeInstanceOf(UnknownDotCommand)
  expect(unknown?.toSource()).toBe(".foo bar")
})
