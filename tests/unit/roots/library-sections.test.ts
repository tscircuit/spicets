import { expect, test } from "bun:test"
import { Lib, LibSection, Model, SpiceLibrary, parseSpiceLibrary } from "lib"

test("reconstructs authored process corners and their model ownership", () => {
  const original = new SpiceLibrary({
    sections: [
      new LibSection({
        name: "tt",
        cards: [new Model({ name: "DM", type: "D", params: { IS: "1n" } })],
      }),
      new LibSection({
        name: "ff",
        cards: [new Model({ name: "DM", type: "D", params: { IS: "2n" } })],
      }),
    ],
  })
  const parsed = parseSpiceLibrary(original.toSource())
  expect(parsed.sections.map((s) => s.name)).toEqual(["tt", "ff"])
  expect(parsed.cards).toHaveLength(0)
  expect(
    parsed.sections.map((s) => (s.cards[0] as Model).params.getString()),
  ).toEqual(["IS=1n", "IS=2n"])
  expect(parsed.toSource()).toBe(original.toSource())
})

for (const eol of ["\n", "\r\n", "\r"]) {
  test(`retains section comments, interleaving and line endings ${JSON.stringify(eol)}`, () => {
    const source = [
      "* common",
      ".LIB tt ; typical",
      "* inside",
      ".model DM D (IS=1n)",
      ".ENDL tt ; done",
      ".param outside=3",
      ".lib ff",
      ".model DM D (IS=2n)",
      ".endl",
      "",
    ].join(eol)
    const parsed = parseSpiceLibrary(source)
    expect(parsed.sections).toHaveLength(2)
    expect(parsed.toSource()).toBe(source)
    expect(parsed.getChildren().map((c) => c.type)).toEqual([
      "comment",
      "lib_section",
      "param",
      "lib_section",
    ])
    expect(parsed.sections[0]?.cards[0]?.toSource()).toBe("* inside")
  })
}

test("external references and unclosed declarations remain ordinary cards", () => {
  const parsed = parseSpiceLibrary(
    '.lib "models.lib" tt\n.lib single-file.lib\n',
  )
  expect(parsed.sections).toHaveLength(0)
  expect(parsed.cards).toHaveLength(2)
  expect(parsed.cards.every((c) => c instanceof Lib)).toBe(true)
})

test("nested subcircuits remain in their owning section", () => {
  const source =
    ".lib tt\n.subckt cell a b\nR1 a b 1k\n.ends cell\n.lib external.lib ff\n.endl\n"
  const parsed = parseSpiceLibrary(source)
  expect(parsed.sections[0]?.cards.map((c) => c.type)).toEqual([
    "subckt",
    "lib",
  ])
  expect(parsed.toSource()).toBe(source)
})

test("editing section models affects pretty output and added sections are included", () => {
  const parsed = parseSpiceLibrary(".lib tt\n.model DM D (IS=1n)\n.endl\n")
  const model = parsed.sections[0]?.cards[0] as Model
  model.params.set("IS", "9n")
  parsed.sections.push(new LibSection({ name: "ff" }))
  expect(parsed.toSource({ format: "pretty" })).toBe(
    ".lib tt\n.model DM D (IS=9n)\n.endl\n.lib ff\n.endl\n",
  )
})

test("section array removal and reordering remain visible in traversal and output", () => {
  const parsed = parseSpiceLibrary(
    ".lib tt\n.endl\n.param outside=3\n.lib ff\n.endl\n",
  )
  parsed.sections.reverse()
  expect(
    parsed
      .getChildren()
      .map((c) => (c instanceof LibSection ? c.name : c.type)),
  ).toEqual(["ff", "param", "tt"])
  parsed.sections.splice(0, 1)
  expect(parsed.toSource({ format: "pretty" })).toBe(
    ".lib tt\n.endl\n.param outside=3\n",
  )
})
