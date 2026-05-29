import { expect, test } from "bun:test"
import { NodeRef } from "lib"

test("normalizes node refs without changing names", () => {
  expect(new NodeRef("vout").getString()).toBe("vout")
  expect(NodeRef.ground().getString()).toBe("0")
})
