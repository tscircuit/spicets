import { expect, test } from "bun:test"
import { CurrentSource, VoltageSource, parseSpiceCard } from "lib"

test("parses source cards into voltage and current source classes", () => {
  expect(parseSpiceCard("V1 in 0 DC 5")).toBeInstanceOf(VoltageSource)
  expect(parseSpiceCard("I1 out 0 DC 1m")).toBeInstanceOf(CurrentSource)
})
