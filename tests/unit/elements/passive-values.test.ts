import { expect, test } from "bun:test"
import { Capacitor, Inductor, Resistor, parseSpiceCard } from "lib"

for (const expression of [
  "{base * scale}",
  "{base*scale}",
  "'base * scale'",
  "1k",
]) {
  test(`passive values retain ${expression} through authoring and parsing`, () => {
    const cards = [
      new Resistor({
        name: "R1",
        nodes: ["a", "b"],
        resistance: expression,
        params: { m: 2 },
      }),
      new Capacitor({
        name: "C1",
        nodes: ["a", "b"],
        capacitance: expression,
        ic: 0.2,
        params: { m: 2 },
      }),
      new Inductor({
        name: "L1",
        nodes: ["a", "b"],
        inductance: expression,
        ic: 0.2,
        params: { m: 2 },
      }),
    ]
    for (const card of cards) {
      const parsed = parseSpiceCard(card.toSource())
      expect(parsed.toSource({ format: "pretty" })).toBe(card.toSource())
    }
  })
}

test("continuation inside a value excludes the marker and preserves following parameters", () => {
  const source = "R1 a b {base *\n+ scale} m=2"
  const card = parseSpiceCard(source) as Resistor
  expect(card.resistance.getString()).toBe("{base * scale}")
  expect(card.params.getString()).toBe("m=2")
  expect(card.toSource()).toBe(source)
})
