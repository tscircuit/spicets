import { expect, test } from "bun:test"
import { Include, Lib, parseSpiceCard } from "lib"

test("quoted library paths survive pretty serialization and reparsing", () => {
  const source = '.lib "vendor models/device.lib" tt'
  const card = parseSpiceCard(source) as Lib

  expect(card.path).toBe("vendor models/device.lib")
  expect(card.section).toBe("tt")

  const pretty = card.toSource({ format: "pretty" })
  const roundTrip = parseSpiceCard(pretty) as Lib

  expect(pretty).toBe(source)
  expect(roundTrip.path).toBe(card.path)
  expect(roundTrip.section).toBe(card.section)
})

test("include pretty output retains quotes around a space-containing filename", () => {
  const source = '.include "vendor models/device.lib"'
  const card = parseSpiceCard(source) as Include

  expect(card.path).toBe("vendor models/device.lib")
  expect(card.toSource({ format: "pretty" })).toBe(source)
})

test("constructed paths are quoted only when token boundaries require it", () => {
  expect(new Include("vendor.lib").toSource({ format: "pretty" })).toBe(
    ".include vendor.lib",
  )
  expect(
    new Include("vendor/models/device.lib").toSource({ format: "pretty" }),
  ).toBe('.include "vendor/models/device.lib"')
  expect(
    new Lib({ path: "vendor/models/device.lib", section: "tt" }).toSource({
      format: "pretty",
    }),
  ).toBe('.lib "vendor/models/device.lib" tt')
})

test("constructed paths can switch quote style", () => {
  const path = 'vendor "models"/device.lib'
  const pretty = new Include(path).toSource({ format: "pretty" })

  expect(pretty).toBe(".include '" + path + "'")
  expect((parseSpiceCard(pretty) as Include).path).toBe(path)
})
