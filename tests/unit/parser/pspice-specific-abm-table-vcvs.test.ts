import { readFileSync } from "node:fs"
import { expect, test } from "bun:test"
import {
  RawCard,
  UnknownDotCommand,
  UnknownElementCard,
  parseSpiceNetlist,
} from "lib"

test("round-trips PSpice ABM TABLE VCVS exactly", () => {
  const source = readFileSync(
    "tests/assets/pspice-specific/abm-table-vcvs.cir",
    "utf8",
  )
  const netlist = parseSpiceNetlist(source, { dialect: "pspice" })

  expect(netlist.cards).not.toContainEqual(expect.any(UnknownDotCommand))
  expect(netlist.cards).not.toContainEqual(expect.any(UnknownElementCard))
  expect(netlist.cards).not.toContainEqual(expect.any(RawCard))
  expect(netlist.getString({ dialect: "pspice" })).toBe(source)
  expect(() => netlist.getString()).toThrowErrorMatchingInlineSnapshot(
    `"PSpice-only construct TABLE behavioral voltage source cannot be serialized to target dialect "generic". Serialize with { dialect: "pspice" } or translate/remove the construct before exporting."`,
  )
})
