import { expect, test } from "bun:test"
import { Resistor, SpiceNetlist, Subckt } from "lib"

test("renames nodes across root-level elements and subcircuits", () => {
  const netlist = new SpiceNetlist({
    cards: [
      new Resistor({ name: "R1", nodes: ["old", "0"], resistance: "1k" }),
      new Subckt({
        name: "cell",
        cards: [
          new Resistor({ name: "R2", nodes: ["old", "out"], resistance: "2k" }),
        ],
      }),
    ],
    trailingNewline: false,
  })

  const result = netlist.renameNode("old", "new")

  expect(result).toBeUndefined()
  expect(netlist.getString({ format: "pretty" })).toContain("R1 new 0 1k")
  expect(netlist.getString({ format: "pretty" })).toContain("R2 new out 2k")
})
