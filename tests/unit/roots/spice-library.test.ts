import { expect, test } from "bun:test"
import { Model, SpiceLibrary } from "lib"

test("serializes spice libraries", () => {
  const library = new SpiceLibrary({
    cards: [new Model({ name: "DFAST", type: "D", params: { IS: "1n" } })],
    trailingNewline: false,
  })

  expect(library.getString({ format: "pretty" })).toBe(".model DFAST D (IS=1n)")
})
