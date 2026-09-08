import { expect, test } from "bun:test"
import {
  Resistor,
  Diode,
  VoltageSource,
  Capacitor,
  Inductor,
  Mosfet,
  Bjt,
  Vcvs,
  ElementCard,
  parseSpiceCard,
  tokenizeSpice,
} from "lib"

for (const nodes of [
  ["out+", "out-"],
  ["/sheet/out", "/sheet/gnd"],
  ["out_a", "out_b"],
] as const) {
  test(`two-terminal nodes retain ${nodes.join(" ")}`, () => {
    const cards = [
      new Resistor({ name: "R1", nodes: [...nodes], resistance: "1k" }),
      new Capacitor({ name: "C1", nodes: [...nodes], capacitance: "1n" }),
      new Inductor({ name: "L1", nodes: [...nodes], inductance: "1m" }),
      new Diode({ name: "D1", nodes: [...nodes], model: "DM" }),
      new VoltageSource({ name: "V1", nodes: [...nodes], dc: 5 }),
    ]
    for (const card of cards) {
      const parsed = parseSpiceCard(card.toSource()) as ElementCard
      expect(parsed.nodes.map((n) => n.name)).toEqual([...nodes])
      expect(parsed.toSource({ format: "pretty" })).toBe(card.toSource())
    }
  })
}

test("multi-terminal elements preserve all node fields", () => {
  for (const [source, expected] of [
    ["M1 d+ g- /s /b NM", ["d+", "g-", "/s", "/b"]],
    ["Q1 c+ b- /e /s QN", ["c+", "b-", "/e", "/s"]],
    ["E1 out+ out- in+ in- 10", ["out+", "out-", "in+", "in-"]],
  ] as const) {
    const card = parseSpiceCard(source) as ElementCard
    expect(card.nodes.map((n) => n.name)).toEqual([...expected])
    expect(card.toSource({ format: "pretty" })).toBe(source)
  }
})

test("low-level arithmetic operator tokens remain separate", () => {
  expect(
    tokenizeSpice(".param gain={a+b}").tokens.some(
      (t) => t.type === "operator" && t.raw === "+",
    ),
  ).toBe(true)
  const card = parseSpiceCard("R1 out+ out- 1k m=2") as Resistor
  expect(card.params.getString()).toBe("m=2")
})

test("current and controlled sources retain node fields", () => {
  for (const [source, expected] of [
    ["I1 out+ out- DC 5", ["out+", "out-"]],
    ["F1 out+ out- VS 2", ["out+", "out-"]],
    ["H1 out+ out- VS 2", ["out+", "out-"]],
    ["G1 out+ out- in+ in- 2", ["out+", "out-", "in+", "in-"]],
    ["Q1 c+ b- /e QN", ["c+", "b-", "/e"]],
  ] as const) {
    const card = parseSpiceCard(source) as ElementCard
    expect(card.nodes.map((n) => n.name)).toEqual([...expected])
    expect(card.toSource({ format: "pretty" })).toBe(source)
  }
})

test("node grouping preserves source and continuation boundaries", () => {
  const source = "R1\tout+\n+ /sheet/gnd 1k"
  const card = parseSpiceCard(source) as Resistor
  expect(card.nodes.map((n) => n.name)).toEqual(["out+", "/sheet/gnd"])
  expect(card.toSource()).toBe(source)
  expect(card.toSource({ format: "pretty" })).toBe("R1 out+ /sheet/gnd 1k")
})

test("ABM sources still recognize their expression form", () => {
  for (const designator of ["E", "G"]) {
    const card = parseSpiceCard(
      `${designator}1 out+ out- VALUE {V(in)*2}`,
    ) as ElementCard
    expect(card.type).toBe(
      designator === "E"
        ? "pspice_abm_voltage_source"
        : "pspice_abm_current_source",
    )
    expect(card.nodes.map((n) => n.name)).toEqual(["out+", "out-"])
  }
})
