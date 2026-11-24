import { expect, test } from "bun:test"
import { CurrentSource, VoltageSource, parseSpiceCard } from "lib"

test("parses source cards into voltage and current source classes", () => {
  expect(parseSpiceCard("V1 in 0 DC 5")).toBeInstanceOf(VoltageSource)
  expect(parseSpiceCard("I1 out 0 DC 1m")).toBeInstanceOf(CurrentSource)
})

test("keeps positional dc values before ac specifications", () => {
  const voltage = parseSpiceCard("VIN 13 2 0.001 AC 1") as VoltageSource
  expect(voltage.dc?.getString()).toBe("0.001")
  expect(voltage.ac?.magnitude?.getString()).toBe("1")
  expect(voltage.toSource({ format: "pretty" })).toBe("VIN 13 2 DC 0.001 AC 1")

  const current = parseSpiceCard("IIN 1 5 0.333 AC 1 45") as CurrentSource
  expect(current.dc?.getString()).toBe("0.333")
  expect(current.ac?.magnitude?.getString()).toBe("1")
  expect(current.ac?.phase?.getString()).toBe("45")
})
