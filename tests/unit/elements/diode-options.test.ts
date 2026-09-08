import { expect, test } from "bun:test"
import { Diode, parseSpiceCard } from "lib"

for (const [source, expected] of [
  ["DCLMP 3 7 DMOD 3.0 IC=0.2", "DCLMP 3 7 DMOD 3.0 IC=0.2"],
  ["D1 an cath DFAST OFF", "D1 an cath DFAST OFF"],
  ["D2 an cath DFAST AREA=3 OFF IC=0.2", "D2 an cath DFAST OFF AREA=3 IC=0.2"],
  ["D3 an cath DFAST 3.0 off IC=0.2", "D3 an cath DFAST 3.0 OFF IC=0.2"],
  ["D4 an cath DFAST AREA = 3 IC=0.2", "D4 an cath DFAST AREA=3 IC=0.2"],
  ["D5 an cath DFAST\n+ 3 OFF ; explanation", "D5 an cath DFAST 3 OFF"],
] as const) {
  test(`preserves diode options: ${source}`, () => {
    const card = parseSpiceCard(source) as Diode
    expect(card.toSource()).toBe(source)
    expect(card.toSource({ format: "pretty" })).toBe(expected)
    expect(parseSpiceCard(expected).toSource({ format: "pretty" })).toBe(
      expected,
    )
  })
}

test("authoring exposes area and OFF without inventing default fields", () => {
  const card = new Diode({
    name: "D1",
    nodes: ["a", "k"],
    model: "DM",
    area: 3,
    off: true,
    params: { ic: 0.2 },
  })
  expect(card.area?.getString()).toBe("3")
  expect(card.off).toBe(true)
  expect(card.toSource()).toBe("D1 a k DM 3 OFF ic=0.2")
  expect(
    new Diode({ name: "D2", nodes: ["a", "k"], model: "DM" }).toSource(),
  ).toBe("D2 a k DM")
})

test("OFF in comments, model names and parameter expressions is not a bare flag", () => {
  for (const source of [
    "D1 a k OFF",
    "D1 a k DM ; OFF",
    "D1 a k DM area=off",
    "D1 a k DM area = off",
    "D1 a k DM area={ off + 1 }",
    "D1 a k DM area='off'",
  ]) {
    expect((parseSpiceCard(source) as Diode).off).toBe(false)
  }
})

test("positional area retains a grouped expression", () => {
  const card = parseSpiceCard("D1 a k DM { scale + 1 } OFF") as Diode
  expect(card.area?.getString()).toBe("{ scale + 1 }")
  expect(card.toSource({ format: "pretty" })).toBe(
    "D1 a k DM { scale + 1 } OFF",
  )
})
