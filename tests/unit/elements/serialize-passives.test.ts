import { expect, test } from "bun:test"
import { Capacitor, Inductor, Resistor } from "lib"

test("serializes passive element cards", () => {
  expect(
    new Resistor({
      name: "R1",
      nodes: ["a", "b"],
      resistance: "10k",
      params: { temp: 25 },
    }).toSource({ format: "pretty" }),
  ).toBe("R1 a b 10k temp=25")
  expect(
    new Capacitor({
      name: "C1",
      nodes: ["a", "0"],
      capacitance: "100n",
      ic: 0,
    }).toSource({ format: "pretty" }),
  ).toBe("C1 a 0 100n IC=0")
  expect(
    new Inductor({
      name: "L1",
      nodes: ["a", "b"],
      inductance: "2u",
      ic: "1m",
    }).toSource({ format: "pretty" }),
  ).toBe("L1 a b 2u IC=1m")
})
