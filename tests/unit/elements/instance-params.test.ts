import { expect, test } from "bun:test"
import { SubcktInstance, parseSpiceCard } from "lib"

for (const marker of ["", "params: "]) {
  test(`instance overrides keep their subcircuit and node identities: ${marker}`, () => {
    const card = parseSpiceCard(
      `X1 in out gainstage ${marker}gain=2 offset=1`,
    ) as SubcktInstance
    expect(card.subckt).toBe("gainstage")
    expect(card.nodes.map((node) => node.getString())).toEqual(["in", "out"])
    expect(card.params.get("gain")?.getString()).toBe("2")
    expect(card.params.get("offset")?.getString()).toBe("1")
    const again = parseSpiceCard(
      card.toSource({ format: "pretty" }),
    ) as SubcktInstance
    expect(again.subckt).toBe(card.subckt)
    expect(again.params.getString()).toBe(card.params.getString())
  })
}

test("instance without overrides keeps every node", () => {
  const card = parseSpiceCard("X1 a b c stage") as SubcktInstance
  expect(card.subckt).toBe("stage")
  expect(card.nodes.map((node) => node.getString())).toEqual(["a", "b", "c"])
  expect(card.params.isEmpty).toBe(true)
})
