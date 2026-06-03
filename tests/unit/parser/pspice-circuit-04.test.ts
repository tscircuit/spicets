import { expect, test } from "bun:test"
import { Ac, Probe, VoltageSource } from "lib"
import { parsePspiceFixture } from "./pspice-test-utils"

test("parses PSPICE example circuit-04.cir", () => {
  const netlist = parsePspiceFixture("circuit-04.cir")

  const sourceCard = netlist.findElement("V1")
  expect(sourceCard).toBeInstanceOf(VoltageSource)
  const voltage = sourceCard as VoltageSource
  expect(voltage.dc).toBeUndefined()
  expect(voltage.ac?.magnitude?.getString()).toBe("10V")
  expect(voltage.ac?.phase?.getString()).toBe("0")

  const ac = netlist.analyses.find((card) => card instanceof Ac)
  expect(ac?.sweep).toBe("dec")
  expect(ac?.points).toBe(20)
  expect(ac?.start.getString()).toBe("10KHZ")
  expect(ac?.stop.getString()).toBe("1MEGAHZ")
  expect(
    netlist.directives.filter((card) => card instanceof Probe),
  ).toHaveLength(1)
})
