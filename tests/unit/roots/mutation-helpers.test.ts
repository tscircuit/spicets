import { expect, test } from "bun:test"
import { Op, SpiceNetlist, Tran } from "lib"

test("supports add and addAll mutation", () => {
  const netlist = new SpiceNetlist({ end: false, trailingNewline: false })
  const addResult = netlist.add(new Op())
  const addAllResult = netlist.addAll([new Tran({ step: "1n", stop: "1u" })])

  expect(addResult).toBeUndefined()
  expect(addAllResult).toBeUndefined()
  expect(netlist.getString({ format: "pretty" })).toBe(".op\n.tran 1n 1u")
})
