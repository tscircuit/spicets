import { readFileSync } from "node:fs"
import { expect, test } from "bun:test"
import {
  RawCard,
  UnknownDotCommand,
  UnknownElementCard,
  parseSpiceNetlist,
} from "lib"

test("serializes PSpice ABM VALUE VCVS to ngspice", () => {
  const source = readFileSync(
    "tests/assets/pspice-specific/abm-value-vcvs.cir",
    "utf8",
  )
  const netlist = parseSpiceNetlist(source, { dialect: "pspice" })
  const ngspiceSource = netlist.getString({ dialect: "ngspice" })

  expect(netlist.cards).not.toContainEqual(expect.any(UnknownDotCommand))
  expect(netlist.cards).not.toContainEqual(expect.any(UnknownElementCard))
  expect(netlist.cards).not.toContainEqual(expect.any(RawCard))
  expect(ngspiceSource).toMatchInlineSnapshot(`
    "PSpice ABM VALUE voltage source
    VIN in 0 DC 1
    ESQROOT out 0 VALUE = {5V*SQRT(V(in))}
    RLOAD out 0 10k
    .OP
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
