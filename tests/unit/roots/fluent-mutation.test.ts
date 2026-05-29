import { expect, test } from "bun:test"
import { Op, SpiceNetlist, Tran } from "lib"

test("supports add and addAll fluent mutation", () => {
  const netlist = new SpiceNetlist({ end: false, trailingNewline: false })
    .add(new Op())
    .addAll([new Tran({ step: "1n", stop: "1u" })])

  expect(netlist.getString({ format: "pretty" })).toBe(".op\n.tran 1n 1u")
})
