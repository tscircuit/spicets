import { expect, test } from "bun:test"
import { BlankLine, parseSpiceNetlist } from "lib"

test("preserves empty blank lines during round trip", () => {
  const source = "R1 in out 10k\n\nC1 out 0 1u\n.end\n"
  const netlist = parseSpiceNetlist(source)

  expect(netlist.cards[1]).toBeInstanceOf(BlankLine)
  expect(netlist.getString()).toBe(source)
})
