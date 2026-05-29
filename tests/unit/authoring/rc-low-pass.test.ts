import { expect, test } from "bun:test"
import { Capacitor, Resistor, SpiceNetlist, Tran, VoltageSource } from "lib"

test("authors an RC low-pass deck from specific card classes", () => {
  const netlist = new SpiceNetlist({
    title: "RC low-pass demo",
    cards: [
      new VoltageSource({ name: "V1", nodes: ["vin", "0"], dc: 5 }),
      new Resistor({ name: "R1", nodes: ["vin", "vout"], resistance: "10k" }),
      new Capacitor({ name: "C1", nodes: ["vout", "0"], capacitance: "100n" }),
      new Tran({ step: "1us", stop: "10ms" }),
    ],
    trailingNewline: false,
  })

  expect(netlist.getString({ format: "pretty" })).toBe(
    [
      "RC low-pass demo",
      "V1 vin 0 DC 5",
      "R1 vin vout 10k",
      "C1 vout 0 100n",
      ".tran 1us 10ms",
      ".end",
    ].join("\n"),
  )
})
