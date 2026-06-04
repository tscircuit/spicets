import { readFileSync } from "node:fs"
import { expect, test } from "bun:test"
import {
  RawCard,
  UnknownDotCommand,
  UnknownElementCard,
  parseSpiceNetlist,
} from "lib"

test("serializes PSpice ABM VALUE VCCS to ngspice", () => {
  const source = readFileSync(
    "tests/assets/pspice-specific/abm-value-vccs.cir",
    "utf8",
  )
  const netlist = parseSpiceNetlist(source, { dialect: "pspice" })
  const ngspiceSource = netlist.getString({ dialect: "ngspice" })

  expect(netlist.cards).not.toContainEqual(expect.any(UnknownDotCommand))
  expect(netlist.cards).not.toContainEqual(expect.any(UnknownElementCard))
  expect(netlist.cards).not.toContainEqual(expect.any(RawCard))
  expect(ngspiceSource).toMatchInlineSnapshot(`
    "PSpice ABM VALUE current source
    V1 n1 0 SIN(0 1 10k)
    V2 n2 0 DC 0.5
    GPSK out 0 VALUE = {5MA*SIN(6.28*10kHz*TIME+V(n1))}
    GT load 0 VALUE = {200E-6*PWR(V(n1)*V(n2),1.5)}
    R1 out 0 1k
    R2 load 0 1k
    .TRAN 1us 1ms
    .PROBE V(out) V(load)
    .END
    "
  `)

  const reparsed = parseSpiceNetlist(ngspiceSource, { dialect: "ngspice" })
  expect(reparsed.cards).not.toContainEqual(expect.any(UnknownDotCommand))
  expect(reparsed.cards).not.toContainEqual(expect.any(UnknownElementCard))
  expect(reparsed.cards).not.toContainEqual(expect.any(RawCard))
  expect(reparsed.getString({ dialect: "ngspice" })).toBe(ngspiceSource)
})
