import { expect, test } from "bun:test"
import { Resistor, SpiceNetlist, Tran, VoltageSource } from "lib"

test("serializes hand-authored netlists with specific card classes", () => {
  const netlist = new SpiceNetlist({
    title: "RC low-pass",
    cards: [
      new VoltageSource({ name: "V1", nodes: ["vin", "0"], dc: 5 }),
      new Resistor({
        name: "Rload",
        nodes: ["vin", "0"],
        resistance: "10k",
        params: { temp: 25 },
      }),
      new Tran({ step: "1us", stop: "10ms" }),
    ],
    trailingNewline: false,
  })

  expect(netlist.getString({ format: "pretty" })).toBe(
    "RC low-pass\nV1 vin 0 DC 5\nRload vin 0 10k temp=25\n.tran 1us 10ms\n.end",
  )
})
