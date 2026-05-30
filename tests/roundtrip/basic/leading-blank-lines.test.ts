import { expect, test } from "bun:test"
import { BlankLine, parseSpiceNetlist } from "lib"

test("preserves leading empty blank lines during round trip", () => {
  const source = "\nR1 in out 10k\n.end\n"
  const netlist = parseSpiceNetlist(source)

  expect(netlist.cards[0]).toBeInstanceOf(BlankLine)
  expect(netlist.getString()).toBe(source)
})
