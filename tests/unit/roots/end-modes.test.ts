import { expect, test } from "bun:test"
import { Op, SpiceNetlist } from "lib"

test("supports end serialization modes", () => {
  const netlist = new SpiceNetlist({
    cards: [new Op()],
    trailingNewline: false,
  })

  expect(netlist.getString({ format: "pretty", end: "auto" })).toBe(".op\n.end")
  expect(netlist.getString({ format: "pretty", end: "never" })).toBe(".op")
  expect(
    new SpiceNetlist({ cards: [new Op()], end: false, trailingNewline: false })
      .getString({ format: "pretty", end: "always" }),
  ).toBe(".op\n.end")
})
