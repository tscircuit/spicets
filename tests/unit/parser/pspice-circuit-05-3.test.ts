import { expect, test } from "bun:test"
import { Capacitor, Inductor, Probe, Tran } from "lib"
import { parsePspiceFixture } from "./pspice-test-utils"

test("parses PSPICE example circuit-05-3.cir", () => {
  const netlist = parsePspiceFixture("circuit-05-3.cir")

  const inductor = netlist.findElement("L1")
  const capacitor = netlist.findElement("C1")
  const tran = netlist.analyses.find((card) => card instanceof Tran)

  expect(inductor).toBeInstanceOf(Inductor)
  expect(capacitor).toBeInstanceOf(Capacitor)
  expect((inductor as Inductor).initialCondition?.getString()).toBe("-10A")
  expect((capacitor as Capacitor).initialCondition?.getString()).toBe("0V")
  expect(tran?.step?.getString()).toBe("0.1pS")
  expect(tran?.stop.getString()).toBe("5s")
  expect(
    netlist.directives.filter((card) => card instanceof Probe),
  ).toHaveLength(1)
})
