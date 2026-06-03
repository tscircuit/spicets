import { expect, test } from "bun:test"
import { Capacitor, Probe, Tran } from "lib"
import { parsePspiceFixture } from "./pspice-test-utils"

test("parses PSPICE example circuit-03.cir", () => {
  const netlist = parsePspiceFixture("circuit-03.cir")

  const cap = netlist.findElement("C1")
  expect(cap).toBeInstanceOf(Capacitor)
  expect((cap as Capacitor).initialCondition?.getString()).toBe("0.0V")

  const tran = netlist.analyses.find((card) => card instanceof Tran)
  expect(tran?.uic).toBe(true)
  expect(
    netlist.directives.filter((card) => card instanceof Probe),
  ).toHaveLength(1)
})
