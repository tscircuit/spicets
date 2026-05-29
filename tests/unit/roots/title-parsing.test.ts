import { expect, test } from "bun:test"
import { Resistor, parseSpiceNetlist } from "lib"

test("parses title separately from cards", () => {
  const netlist = parseSpiceNetlist("amplifier\nR1 in out 10k\n.end\n")

  expect(netlist.title).toBe("amplifier")
  expect(netlist.cards[0]).toBeInstanceOf(Resistor)
})
