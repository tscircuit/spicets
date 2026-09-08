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

for (const input of ["SIN (0, 1, 1k)", "SIN(0 1\n+ 1k)"]) {
  test(`accepts waveform separators: ${input}`, () => {
    const card = parseSpiceCard(`V1 out 0 ${input}`) as VoltageSource
    expect(card.transient?.toSource()).toBe("SIN(0 1 1k)")
    expect(card.dc).toBeUndefined()
  })
}

test("DC and AC symbol prefixes are values rather than clause keywords", () => {
  const card = parseSpiceCard(
    "V1 out 0 DC dc_bias AC ac_gain SIN(0 1 1k)",
  ) as VoltageSource
  expect(card.dc?.getString()).toBe("dc_bias")
  expect(card.ac?.magnitude?.getString()).toBe("ac_gain")
  expect(card.ac?.phase).toBeUndefined()
  expect(card.transient?.toSource()).toBe("SIN(0 1 1k)")
})

for (const waveform of [
  "PWL(0 0 1u)",
  "PULSE(0 1 0 1n 1n 1u 2u 4)",
  "SIN(0)",
]) {
  test(`does not truncate waveform arguments outside the typed representation: ${waveform}`, () => {
    const card = parseSpiceCard(`V1 out 0 ${waveform}`) as VoltageSource
    expect(card.transient?.toSource()).toBe(waveform)
    expect(card.toSource({ format: "pretty" })).toBe(`V1 out 0 ${waveform}`)
  })
}

test("DC source control remains parsed", () => {
  const card = parseSpiceCard("V1 out 0 DC 5") as VoltageSource
  expect(card.dc?.getString()).toBe("5")
  expect(card.toSource({ format: "pretty" })).toBe("V1 out 0 DC 5")
})

for (const tail of [
  "DC 2 AC 1 SIN(0 1 1k)",
  "SIN(0 1 1k) DC 2 AC 1",
  "AC 1 90 SIN(0 1 1k) DC 2",
]) {
  test(`source clauses retain independent boundaries: ${tail}`, () => {
    const card = parseSpiceCard(`V1 out 0 ${tail}`) as VoltageSource
    expect(card.dc?.getString()).toBe("2")
    expect(card.ac?.magnitude?.getString()).toBe("1")
    expect(card.ac?.phase?.getString()).toBe(
      tail.includes("90") ? "90" : undefined,
    )
    expect(card.transient?.toSource()).toBe("SIN(0 1 1k)")
  })
}
