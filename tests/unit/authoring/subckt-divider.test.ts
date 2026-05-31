import { expect, test } from "bun:test"
import {
  Op,
  Resistor,
  SpiceNetlist,
  Subckt,
  SubcktInstance,
  VoltageSource,
} from "lib"

test("authors a subcircuit and instance with params", () => {
  const divider = new Subckt({
    name: "divider",
    pins: ["vin", "vout", "0"],
    params: { rtop: "10k", rbot: "10k" },
    cards: [
      new Resistor({
        name: "Rtop",
        nodes: ["vin", "vout"],
        resistance: "{rtop}",
      }),
      new Resistor({
        name: "Rbot",
        nodes: ["vout", "0"],
        resistance: "{rbot}",
      }),
    ],
  })
  const netlist = new SpiceNetlist({
    title: "divider demo",
    cards: [
      divider,
      new VoltageSource({ name: "V1", nodes: ["vin", "0"], dc: 5 }),
      new SubcktInstance({
        name: "X1",
        nodes: ["vin", "vout", "0"],
        subckt: "divider",
        params: { rtop: "20k" },
      }),
      new Op(),
    ],
    trailingNewline: false,
  })

  expect(netlist.getString({ format: "pretty" })).toBe(
    [
      "divider demo",
      ".subckt divider vin vout 0 params: rtop=10k rbot=10k",
      "Rtop vin vout {rtop}",
      "Rbot vout 0 {rbot}",
      ".ends divider",
      "V1 vin 0 DC 5",
      "X1 vin vout 0 divider rtop=20k",
      ".op",
      ".end",
    ].join("\n"),
  )
})
