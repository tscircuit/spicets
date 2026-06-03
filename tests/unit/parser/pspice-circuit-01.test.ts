import { expect, test } from "bun:test"
import { CurrentSource, Dc, Options, Print, Resistor, VoltageSource } from "lib"
import { parsePspiceFixture } from "./pspice-test-utils"

test("parses PSPICE example circuit-01.cir", () => {
  const netlist = parsePspiceFixture("circuit-01.cir")

  expect(netlist.cards.filter((card) => card instanceof Resistor)).toHaveLength(
    5,
  )
  expect(
    netlist.cards.filter((card) => card instanceof VoltageSource),
  ).toHaveLength(2)
  expect(
    netlist.cards.filter((card) => card instanceof CurrentSource),
  ).toHaveLength(1)
  expect(netlist.directives.filter((card) => card instanceof Dc)).toHaveLength(
    1,
  )
  expect(
    netlist.directives.filter((card) => card instanceof Options),
  ).toHaveLength(1)

  const print = netlist.directives.find((card) => card instanceof Print)
  expect(print?.analysis).toBe("DC")
  expect(print?.expressions).toHaveLength(16)
  expect(print?.expressions.at(0)).toBe("V(R1)")
  expect(print?.expressions.at(-1)).toBe("I(I1)")
})
