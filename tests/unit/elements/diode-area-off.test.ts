import { expect, test } from "bun:test"
import { Diode, parseSpiceCard } from "lib"

for (const source of [
  "DCLMP 3 7 DMOD 3.0 IC=0.2",
  "D1 an cath DFAST OFF",
  "D2 an cath DFAST AREA=3 OFF IC=0.2",
  "D3 an cath DFAST 3.0 OFF IC=0.2",
]) {
  test(`pretty serialization keeps diode area and OFF: ${source}`, () => {
    const card = parseSpiceCard(source) as Diode
    expect(card).toBeInstanceOf(Diode)
    expect(card.toSource({ format: "pretty" })).toBe(source)
  })
}

test("named area without OFF still serializes", () => {
  const card = parseSpiceCard("D4 an cath DFAST AREA=3 IC=0.2") as Diode
  expect(card.toSource({ format: "pretty" })).toBe(
    "D4 an cath DFAST AREA=3 IC=0.2",
  )
})
