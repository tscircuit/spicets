import { expect, test } from "bun:test"
import { CurrentSource, VoltageSource, parseSpiceCard } from "lib"

for (const designator of ["V", "I"]) {
  for (const waveform of [
    "SIN(0 1 1k)",
    "PULSE(0 5 0 1n 1n 1u 2u)",
    "PWL(0 0 1u 5 2u 0)",
  ]) {
    test(`parses ${designator} transient waveform ${waveform}`, () => {
      const source = `${designator}1 out 0 ${waveform}`
      const card = parseSpiceCard(source) as VoltageSource | CurrentSource
      const pretty = card.toSource({ format: "pretty" })
      expect(card.toSource()).toBe(source)
      expect(card.transient?.toSource()).toBe(waveform)
      expect(card.dc).toBeUndefined()
      expect(pretty).toBe(source)
    })
  }
}

test("DC source control remains parsed", () => {
  const card = parseSpiceCard("V1 out 0 DC 5") as VoltageSource
  expect(card.dc?.getString()).toBe("5")
  expect(card.toSource({ format: "pretty" })).toBe("V1 out 0 DC 5")
})
