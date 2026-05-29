import { expect, test } from "bun:test"
import { Model, Resistor, SpiceNetlist, Subckt } from "lib"

test("finds elements, models, and subcircuits case-insensitively", () => {
  const netlist = new SpiceNetlist({
    cards: [
      new Resistor({ name: "RLOAD", nodes: ["out", "0"], resistance: "10k" }),
      new Model({ name: "DFAST", type: "D" }),
      new Subckt({ name: "divider" }),
    ],
  })

  expect(netlist.findElement("rload")).toBeInstanceOf(Resistor)
  expect(netlist.findModel("dfast")).toBeInstanceOf(Model)
  expect(netlist.findSubckt("DIVIDER")).toBeInstanceOf(Subckt)
})
