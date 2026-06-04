import { readFileSync } from "node:fs"
import { expect, test } from "bun:test"
import {
  RawCard,
  UnknownDotCommand,
  UnknownElementCard,
  parseSpiceNetlist,
} from "lib"

test("serializes PSpice ABM TABLE VCVS to ngspice", () => {
  const source = readFileSync(
    "tests/assets/pspice-specific/abm-table-vcvs.cir",
    "utf8",
  )
  const netlist = parseSpiceNetlist(source, { dialect: "pspice" })
  const ngspiceSource = netlist.getString({ dialect: "ngspice" })

  expect(netlist.cards).not.toContainEqual(expect.any(UnknownDotCommand))
  expect(netlist.cards).not.toContainEqual(expect.any(UnknownElementCard))
  expect(netlist.cards).not.toContainEqual(expect.any(RawCard))
  expect(ngspiceSource).toMatchInlineSnapshot(`
    "PSpice ABM TABLE voltage source
    VIN anode 0 DC 0
    VREF cathode 0 DC 0
    ET2 out 0 TABLE {V(anode,cathode)} = (0,0) (30,1)
    RLOAD out 0 10k
    .DC VIN 0 30 1
    .PROBE V(out)
    .END
    "
  `)

  const reparsed = parseSpiceNetlist(ngspiceSource, { dialect: "ngspice" })
  expect(reparsed.cards).not.toContainEqual(expect.any(UnknownDotCommand))
  expect(reparsed.cards).not.toContainEqual(expect.any(UnknownElementCard))
  expect(reparsed.cards).not.toContainEqual(expect.any(RawCard))
  expect(reparsed.getString({ dialect: "ngspice" })).toBe(ngspiceSource)
})
