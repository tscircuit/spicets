import { expect, test } from "bun:test"
import { Resistor, SpiceNetlist, Subckt, SubcktInstance } from "lib"

test("renaming a subcircuit port keeps its header and body connected", () => {
  const resistor = new Resistor({
    name: "R1",
    nodes: ["old", "out"],
    resistance: "1k",
  })
  const cell = new Subckt({
    name: "cell",
    pins: ["old", "out"],
    cards: [resistor],
  })
  const instance = new SubcktInstance({
    name: "X1",
    nodes: ["old", "0"],
    subckt: "cell",
  })
  const netlist = new SpiceNetlist({ cards: [cell, instance] })
  netlist.renameNode("old", "new")
  expect(resistor.nodes.map((n) => n.name)).toEqual(["new", "out"])
  expect(instance.nodes.map((n) => n.name)).toEqual(["new", "0"])
  expect(cell.pins.map((n) => n.name)).toEqual(["new", "out"])
  expect(netlist.toSource({ format: "pretty" })).toContain(
    ".subckt cell new out",
  )
})

test("renaming traverses nested subcircuit ports and internal elements", () => {
  const resistor = new Resistor({
    name: "R2",
    nodes: ["old", "keep"],
    resistance: "2k",
  })
  const inner = new Subckt({
    name: "inner",
    pins: ["old", "keep"],
    cards: [resistor],
  })
  const outer = new Subckt({
    name: "outer",
    pins: ["old", "keep"],
    cards: [inner],
  })
  const netlist = new SpiceNetlist({ cards: [outer] })
  netlist.renameNode("old", "new")
  expect(outer.pins.map((n) => n.name)).toEqual(["new", "keep"])
  expect(inner.pins.map((n) => n.name)).toEqual(["new", "keep"])
  expect(resistor.nodes.map((n) => n.name)).toEqual(["new", "keep"])
  expect(inner.name).toBe("inner")
})
