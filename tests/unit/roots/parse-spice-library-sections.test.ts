import { expect, test } from "bun:test"
import {
  Lib,
  LibSection,
  Model,
  parseSpiceLibrary,
  SpiceLibrary,
} from "../../../lib"

test("parseSpiceLibrary reconstructs .lib/.endl sections on authored library round-trip", () => {
  const library = new SpiceLibrary({
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

  const source = library.toSource()
  const parsed = parseSpiceLibrary(source)

  expect(parsed.sections.map((s) => s.name)).toEqual(["tt", "ff"])
  expect(parsed.cards).toEqual([])
  expect(parsed.sections[0]?.cards).toHaveLength(1)
  expect(
    (parsed.sections[0]!.cards[0] as Model).params.get("IS")?.getString(),
  ).toBe("1n")
  expect(
    (parsed.sections[1]!.cards[0] as Model).params.get("IS")?.getString(),
  ).toBe("2n")
  expect(parsed.toSource()).toBe(source)
  expect(parsed.toSource({ format: "pretty" })).toBe(
    library.toSource({ format: "pretty" }),
  )
})

test("parseSpiceLibrary keeps external .lib filename section directives as top-level cards", () => {
  const parsed = parseSpiceLibrary(
    '.lib "models.lib" tt\n.lib local\n.model M1 NMOS\n.endl\n',
  )
  expect(parsed.cards).toHaveLength(1)
  expect(parsed.cards[0]).toBeInstanceOf(Lib)
  expect((parsed.cards[0] as Lib).path).toBe("models.lib")
  expect((parsed.cards[0] as Lib).section).toBe("tt")
  expect(parsed.sections.map((s) => s.name)).toEqual(["local"])
})
