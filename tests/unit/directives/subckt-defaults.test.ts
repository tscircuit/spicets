import { expect, test } from "bun:test"
import { Subckt, parseSpiceCard } from "lib"

for (const marker of ["", "params: "]) {
  test(`subcircuit defaults are not pins, marker=${marker}`, () => {
    const card = parseSpiceCard(
      `.subckt gainstage in out ${marker}gain=2\n.ends gainstage`,
    ) as Subckt
    expect(card.pins.map((p) => p.getString())).toEqual(["in", "out"])
    expect(card.params.get("gain")?.getString()).toBe("2")
    const roundTrip = parseSpiceCard(
      card.toSource({ format: "pretty" }),
    ) as Subckt
    expect(roundTrip.pins.map((p) => p.getString())).toEqual(["in", "out"])
    expect(roundTrip.params.get("gain")?.getString()).toBe("2")
  })
}

test("several defaults and whitespace around equals stay out of the pin list", () => {
  const card = parseSpiceCard(
    ".subckt stage a b gain = 2 offset=1\n.ends stage",
  ) as Subckt
  expect(card.pins.map((p) => p.getString())).toEqual(["a", "b"])
  expect(card.params.get("gain")?.getString()).toBe("2")
  expect(card.params.get("offset")?.getString()).toBe("1")
})

test("plain subcircuit keeps all pins and body cards", () => {
  const card = parseSpiceCard(
    ".subckt stage a b c\nR1 a b 1k\n.ends stage",
  ) as Subckt
  expect(card.pins.map((p) => p.getString())).toEqual(["a", "b", "c"])
  expect(card.params.isEmpty).toBe(true)
  expect(card.cards).toHaveLength(1)
})
