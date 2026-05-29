import { expect, test } from "bun:test"
import { Op, Resistor, parseSpiceNetlist } from "lib"

test("parses root netlists with ordered typed cards", () => {
  const netlist = parseSpiceNetlist("R1 in out 10k\n.op\n")

  expect(netlist.getChildren()).toHaveLength(2)
  expect(netlist.cards[0]).toBeInstanceOf(Resistor)
  expect(netlist.cards[1]).toBeInstanceOf(Op)
})
