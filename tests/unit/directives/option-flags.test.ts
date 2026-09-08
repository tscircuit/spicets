import { expect, test } from "bun:test"
import { Options, parseSpiceCard } from "lib"

for (const source of [
  ".options noacct",
  ".options klu savecurrents",
  ".options noacct reltol=0.005",
]) {
  test(`pretty formatting preserves flag options: ${source}`, () => {
    const card = parseSpiceCard(source) as Options
    expect(card).toBeInstanceOf(Options)
    expect(card.toSource()).toBe(source)
    expect(card.toSource({ format: "pretty" })).toBe(source)
  })
}

test("assigned option control retains its value", () => {
  const card = parseSpiceCard(".options reltol=0.005") as Options
  expect(card.values.get("reltol")?.getString()).toBe("0.005")
  expect(card.toSource({ format: "pretty" })).toBe(".options reltol=0.005")
})
