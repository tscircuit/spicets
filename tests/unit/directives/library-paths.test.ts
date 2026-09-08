import { expect, test } from "bun:test"
import { Include, Lib, parseSpiceCard } from "lib"

test("quoted library paths survive pretty serialization and reparsing", () => {
  const source = '.lib "vendor models/device.lib" tt'
  const card = parseSpiceCard(source) as Lib
  expect(card.path).toBe("vendor models/device.lib")
  expect(card.section).toBe("tt")
  const pretty = card.toSource({ format: "pretty" })
  const roundTrip = parseSpiceCard(pretty) as Lib
  expect(roundTrip.path).toBe(card.path)
  expect(roundTrip.section).toBe(card.section)
})

test("include pretty output retains quotes around a space-containing filename", () => {
  const card = parseSpiceCard('.include "vendor models/device.lib"') as Include
  expect(card.path).toBe("vendor models/device.lib")
  expect(card.toSource({ format: "pretty" })).toBe(
    '.include "vendor models/device.lib"',
  )
})
