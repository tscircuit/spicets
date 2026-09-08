import { expect, test } from "bun:test"
import { Resistor, parseSpiceNetlist } from "lib"

for (const eol of ["\n", "\r\n"]) {
  test(`preserves source after the end card ${JSON.stringify(eol)}`, () => {
    const source = [
      "R1 a 0 1k",
      ".END ; terminal",
      "* trailing note",
      "",
      "R2 b 0 2k",
      "",
    ].join(eol)
    const parsed = parseSpiceNetlist(source)
    expect(parsed.toSource()).toBe(source)
    expect(parsed.elements.map((e) => e.name)).toEqual(["R1"])
    expect(parsed.getChildren().map((c) => c.type)).toEqual([
      "resistor",
      "end",
      "comment",
      "blank",
      "resistor",
    ])
  })
}

test("new active cards are inserted before the end and trailing material", () => {
  const parsed = parseSpiceNetlist("R1 a 0 1k\n.end\n* note\n")
  parsed.add(new Resistor({ name: "R2", nodes: ["b", "0"], resistance: "2k" }))
  expect(parsed.toSource()).toBe("R1 a 0 1k\nR2 b 0 2k\n.end\n* note\n")
})

test("an absent end and explicit end modes retain their behavior", () => {
  const parsed = parseSpiceNetlist("R1 a 0 1k")
  expect(parsed.toSource()).toBe("R1 a 0 1k")
  expect(parsed.toSource({ end: "always" })).toBe("R1 a 0 1k\n.end")
  const trailer = parseSpiceNetlist("R1 a 0 1k\n.end\n* note")
  expect(trailer.toSource({ end: "never" })).toBe("R1 a 0 1k\n* note")
})
