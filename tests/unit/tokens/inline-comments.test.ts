import { expect, test } from "bun:test"
import { Comment, Lib, Temp, parseSpiceCard } from "lib"

for (const marker of [";", "$"]) {
  test(`inline ${marker} comments do not become temperature values`, () => {
    const source = `.temp 25 ${marker} 100`
    const card = parseSpiceCard(source) as Temp

    expect(card).toBeInstanceOf(Temp)
    expect(card.values.map((value) => value.getString())).toEqual(["25"])
    expect(card.toSource()).toBe(source)
    expect(card.toSource({ format: "pretty" })).toBe(".temp 25")
  })

  test(`inline ${marker} comments do not fill optional arguments`, () => {
    const source = `.lib devices.lib ${marker} fast`
    const card = parseSpiceCard(source) as Lib

    expect(card.path).toBe("devices.lib")
    expect(card.section).toBeUndefined()
    expect(card.toSource()).toBe(source)
    expect(card.toSource({ format: "pretty" })).toBe(".lib devices.lib")
  })

  test(`arguments continue after an inline ${marker} comment`, () => {
    const source = `.temp 25 ${marker} first temperature\n+ 100 ${marker} second temperature`
    const card = parseSpiceCard(source) as Temp

    expect(card.values.map((value) => value.getString())).toEqual(["25", "100"])
    expect(card.toSource()).toBe(source)
    expect(card.toSource({ format: "pretty" })).toBe(".temp 25 100")
  })
}

for (const marker of ["*", ";", "$"] as const) {
  test(`standalone ${marker} comments keep their text and marker`, () => {
    const source = `  ${marker} temperature settings`
    const card = parseSpiceCard(source) as Comment

    expect(card).toBeInstanceOf(Comment)
    expect(card.marker).toBe(marker)
    expect(card.text).toBe("temperature settings")
    expect(card.toSource()).toBe(source)
    expect(card.toSource({ format: "pretty" })).toBe(
      `${marker} temperature settings`,
    )
  })
}

test("comment markers inside a quoted argument remain part of the value", () => {
  const card = parseSpiceCard(
    '.lib "devices;$*.lib" fast ; documentation',
  ) as Lib

  expect(card.path).toBe("devices;$*.lib")
  expect(card.section).toBe("fast")
})
