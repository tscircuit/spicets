import { expect, test } from "bun:test"
import { Capacitor, Inductor, Resistor, parseSpiceCard } from "lib"

test("parses passive element cards into specific classes", () => {
  expect(parseSpiceCard("R1 a b 10k")).toBeInstanceOf(Resistor)
  expect(parseSpiceCard("C1 a 0 100n")).toBeInstanceOf(Capacitor)
  expect(parseSpiceCard("L1 a b 2u")).toBeInstanceOf(Inductor)
})
