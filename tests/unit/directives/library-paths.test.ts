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

for (const path of [
  "vendor.lib",
  "vendor models/device.lib",
  "models/device.lib",
  "C:\\Vendor Models\\device.lib",
  "vendor's device.lib",
  'vendor "A"/device.lib',
  "models/$rev;1.lib",
]) {
  test(`constructed file references preserve filename: ${path}`, () => {
    const include = new Include(path)
    const library = new Lib({ path, section: "tt" })
    const parsedInclude = parseSpiceCard(
      include.toSource({ format: "pretty" }),
    ) as Include
    const parsedLib = parseSpiceCard(
      library.toSource({ format: "pretty" }),
    ) as Lib
    expect(parsedInclude.path).toBe(path)
    expect(parsedLib.path).toBe(path)
    expect(parsedLib.section).toBe("tt")
  })
}

test("original source and simple filenames retain their formatting", () => {
  const source = ".include 'vendor models/device.lib'"
  expect(parseSpiceCard(source).toSource()).toBe(source)
  expect(new Include("vendor.lib").toSource()).toBe(".include vendor.lib")
  expect(new Lib({ path: "vendor.lib", section: "tt" }).toSource()).toBe(
    ".lib vendor.lib tt",
  )
})

test("unrepresentable filenames fail explicitly instead of emitting another card", () => {
  for (const path of ["a\nb.lib", "a\rb.lib", `a'\"b.lib`]) {
    expect(() => new Include(path).toSource()).toThrow()
    expect(() => new Lib({ path, section: "tt" }).toSource()).toThrow()
  }
})

test("include pretty output retains quotes around a space-containing filename", () => {
  const card = parseSpiceCard('.include "vendor models/device.lib"') as Include
  expect(card.path).toBe("vendor models/device.lib")
  expect(card.toSource({ format: "pretty" })).toBe(
    '.include "vendor models/device.lib"',
  )
})
