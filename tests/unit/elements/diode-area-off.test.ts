import { expect, test } from "bun:test"
import { Diode, parseSpiceCard } from "../../../lib"

for (const source of [
  "DCLMP 3 7 DMOD 3.0 IC=0.2",
  "D1 an cath DFAST OFF",
  "D2 an cath DFAST AREA=3 OFF IC=0.2",
  "D3 an cath DFAST 3.0 OFF IC=0.2",
]) {
  test(`pretty serialization preserves diode area and OFF state: ${source}`, () => {
    const card = parseSpiceCard(source) as Diode
    expect(card).toBeInstanceOf(Diode)
    expect(card.toSource()).toBe(source)
    expect(card.toSource({ format: "pretty" })).toBe(source)
  })
}

test("diode area and off properties are populated on AST", () => {
  const d3 = parseSpiceCard("D3 an cath DFAST 3.0 OFF IC=0.2") as Diode
  expect(d3.area?.getString()).toBe("3.0")
  expect(d3.off).toBe(true)
  expect(d3.params.get("IC")?.getString()).toBe("0.2")
})
