import { expect, test } from "bun:test"
import { SpiceExpression, SpiceValue } from "lib"

test("keeps values and expressions as source-level strings", () => {
  expect(new SpiceValue("10k").getString()).toBe("10k")
  expect(new SpiceValue(5).getString()).toBe("5")
  expect(new SpiceExpression("{rload * 2}").getString()).toBe("{rload * 2}")
})
