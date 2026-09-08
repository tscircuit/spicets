import { expect, test } from "bun:test"
import { parseSpiceCards, parseSpiceLibrary, Resistor, Subckt } from "lib"

const lines = [
  ".subckt outer a b",
  "Rbefore a b 1k",
  ".SUBCKT inner x y",
  ".subckt leaf p q",
  "Rleaf p q 2k",
  ".ends leaf",
  "Rinner x y 3k",
  ".ENDS inner",
  ".subckt sibling x y",
  "Rsibling x y 4k",
  ".ends sibling",
  "Rafter a b 5k",
  ".ends outer",
  "Rtop a 0 6k",
]

function checkStructure(source: string) {
  const cards = parseSpiceCards(source)
  expect(cards).toHaveLength(2)
  expect(cards[1]).toBeInstanceOf(Resistor)
  const outer = cards[0] as Subckt
  expect(outer).toBeInstanceOf(Subckt)
  expect(outer.endsName).toBe("outer")
  expect(outer.cards).toHaveLength(4)
  expect(outer.cards[0]).toBeInstanceOf(Resistor)
  expect(outer.cards[3]).toBeInstanceOf(Resistor)
  const inner = outer.cards[1] as Subckt
  expect(inner).toBeInstanceOf(Subckt)
  expect(inner.endsName).toBe("inner")
  expect(inner.cards).toHaveLength(2)
  expect(inner.cards[1]).toBeInstanceOf(Resistor)
  const leaf = inner.cards[0] as Subckt
  expect(leaf).toBeInstanceOf(Subckt)
  expect(leaf.endsName).toBe("leaf")
  expect(leaf.cards).toHaveLength(1)
  expect(leaf.cards[0]).toBeInstanceOf(Resistor)
  const sibling = outer.cards[2] as Subckt
  expect(sibling).toBeInstanceOf(Subckt)
  expect(sibling.endsName).toBe("sibling")
  expect(sibling.cards).toHaveLength(1)
  expect(sibling.cards[0]).toBeInstanceOf(Resistor)
}

for (const newline of ["\n", "\r\n", "\r"]) {
  test(`preserves nested ownership with ${JSON.stringify(newline)} lines`, () => {
    const source = lines.join(newline) + newline
    checkStructure(source)
    const library = parseSpiceLibrary(source)
    expect(library.toSource()).toBe(source)
    const outer = library.cards[0] as Subckt
    const inner = outer.cards[1] as Subckt
    expect(inner.toSource()).toBe(lines.slice(2, 8).join(newline))
    checkStructure(library.toSource({ format: "pretty" }))
  })
}

test("keeps adjacent flat definitions separate", () => {
  const cards = parseSpiceCards(
    ".subckt a x y\nR1 x y 1k\n.ends a\n.subckt b x y\nR2 x y 2k\n.ends b",
  ) as Subckt[]
  expect(cards).toHaveLength(2)
  expect(cards.map((card) => card.endsName)).toEqual(["a", "b"])
  expect(cards.map((card) => card.cards.length)).toEqual([1, 1])
})
