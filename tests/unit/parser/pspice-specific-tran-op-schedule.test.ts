import { readFileSync } from "node:fs"
import { expect, test } from "bun:test"
import {
  RawCard,
  UnknownDotCommand,
  UnknownElementCard,
  parseSpiceNetlist,
} from "lib"

test("round-trips PSpice TRAN/OP schedule exactly", () => {
  const source = readFileSync(
    "tests/assets/pspice-specific/tran-op-schedule.cir",
    "utf8",
  )
  const netlist = parseSpiceNetlist(source, { dialect: "pspice" })

  expect(netlist.cards).not.toContainEqual(expect.any(UnknownDotCommand))
  expect(netlist.cards).not.toContainEqual(expect.any(UnknownElementCard))
  expect(netlist.cards).not.toContainEqual(expect.any(RawCard))
  expect(netlist.getString({ dialect: "pspice" })).toBe(source)
  expect(() => netlist.getString()).toThrowErrorMatchingInlineSnapshot(
    `"PSpice-only construct .TRAN/OP cannot be serialized to target dialect "generic". Serialize with { dialect: "pspice" } or translate/remove the construct before exporting."`,
  )
})
