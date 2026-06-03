import { expect, test } from "bun:test"
import { Cccs, Ccvs, Print, Resistor, Vccs, VoltageSource } from "lib"
import { parsePspiceFixture } from "./pspice-test-utils"

test("parses PSPICE example circuit-02.cir", () => {
  const netlist = parsePspiceFixture("circuit-02.cir")

  expect(netlist.cards.filter((card) => card instanceof Resistor)).toHaveLength(
    5,
  )
  expect(
    netlist.cards.filter((card) => card instanceof VoltageSource),
  ).toHaveLength(2)
  expect(netlist.cards.filter((card) => card instanceof Ccvs)).toHaveLength(1)
  expect(netlist.cards.filter((card) => card instanceof Vccs)).toHaveLength(1)
  expect(netlist.cards.filter((card) => card instanceof Cccs)).toHaveLength(0)
  expect(netlist.findElement("Vm")).toBeInstanceOf(VoltageSource)

  const print = netlist.directives.find((card) => card instanceof Print)
  expect(print?.analysis).toBe("DC")
  expect(print?.expressions).toHaveLength(16)
})
