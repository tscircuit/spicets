import { expect, test } from "bun:test"
import { Model, Resistor, SpiceNetlist, Subckt, Tran, VoltageSource } from "lib"

test("exposes ordered cards and typed convenience getters", () => {
  const subckt = new Subckt({ name: "gain", pins: ["in", "out"] })
  const model = new Model({ name: "DFAST", type: "D" })
  const tran = new Tran({ step: "1n", stop: "1u" })
  const netlist = new SpiceNetlist({
    cards: [
      new VoltageSource({ name: "V1", nodes: ["in", "0"], dc: 1 }),
      new Resistor({ name: "R1", nodes: ["in", "out"], resistance: "1k" }),
      model,
      subckt,
      tran,
    ],
  })

  expect(netlist.cards).toHaveLength(5)
  expect(netlist.elements).toHaveLength(2)
  expect(netlist.directives).toHaveLength(3)
  expect(netlist.models).toEqual([model])
  expect(netlist.subckts).toEqual([subckt])
  expect(netlist.analyses).toEqual([tran])
})
