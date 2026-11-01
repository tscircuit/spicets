import { expect, test } from "bun:test"
import {
  Diode,
  Resistor,
  Subckt,
  SubcktInstance,
  Vcvs,
  VoltageSource,
  parseSpiceCard,
} from "lib"

test("preserves operator characters in element and subckt node names", () => {
  const rAuthored = new Resistor({
    name: "R1",
    nodes: ["out+", "out-"],
    resistance: "1k",
  })
  const rParsed = parseSpiceCard(rAuthored.toSource()) as Resistor
  expect(rParsed.nodes.map((n) => n.name)).toEqual(["out+", "out-"])
  expect(rParsed.resistance.getString()).toBe("1k")
  expect(rParsed.toSource({ format: "pretty" })).toBe("R1 out+ out- 1k")

  const dPlus = parseSpiceCard("D1 out+ out- DM") as Diode
  expect(dPlus.nodes.map((n) => n.name)).toEqual(["out+", "out-"])
  expect(dPlus.model).toBe("DM")
  expect(dPlus.toSource({ format: "pretty" })).toBe("D1 out+ out- DM")

  const vPlus = parseSpiceCard("V1 out+ out- DC 5") as VoltageSource
  expect(vPlus.nodes.map((n) => n.name)).toEqual(["out+", "out-"])
  expect(vPlus.dc?.getString()).toBe("5")
  expect(vPlus.toSource({ format: "pretty" })).toBe("V1 out+ out- DC 5")

  const rSlash = parseSpiceCard("R1 /sheet/out /sheet/gnd 1k") as Resistor
  expect(rSlash.nodes.map((n) => n.name)).toEqual(["/sheet/out", "/sheet/gnd"])
  expect(rSlash.resistance.getString()).toBe("1k")
  expect(rSlash.toSource({ format: "pretty" })).toBe(
    "R1 /sheet/out /sheet/gnd 1k",
  )

  const dSlash = parseSpiceCard("D1 /sheet/out /sheet/gnd DM") as Diode
  expect(dSlash.nodes.map((n) => n.name)).toEqual(["/sheet/out", "/sheet/gnd"])
  expect(dSlash.model).toBe("DM")
  expect(dSlash.toSource({ format: "pretty" })).toBe(
    "D1 /sheet/out /sheet/gnd DM",
  )

  const vSlash = parseSpiceCard(
    "V1 /sheet/out /sheet/gnd DC 5",
  ) as VoltageSource
  expect(vSlash.nodes.map((n) => n.name)).toEqual(["/sheet/out", "/sheet/gnd"])
  expect(vSlash.dc?.getString()).toBe("5")
  expect(vSlash.toSource({ format: "pretty" })).toBe(
    "V1 /sheet/out /sheet/gnd DC 5",
  )

  const vcvs = parseSpiceCard("E1 out+ out- in+ in- 10") as Vcvs
  expect(vcvs.nodes.map((n) => n.name)).toEqual(["out+", "out-", "in+", "in-"])
  expect(vcvs.gain.getString()).toBe("10")

  const xInst = parseSpiceCard("X1 in+ in- /sheet/out opamp") as SubcktInstance
  expect(xInst.nodes.map((n) => n.name)).toEqual(["in+", "in-", "/sheet/out"])
  expect(xInst.subckt).toBe("opamp")

  const subckt = parseSpiceCard(
    ".subckt opamp in+ in- /sheet/out params: gain=10\n.ends opamp",
  ) as Subckt
  expect(subckt.pins.map((p) => p.name)).toEqual(["in+", "in-", "/sheet/out"])
  expect(subckt.params.get("gain")?.getString()).toBe("10")
})
