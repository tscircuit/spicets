import { readFileSync } from "node:fs"
import { expect } from "bun:test"
import {
  RawCard,
  UnknownElementCard,
  UnknownDotCommand,
  type SpiceNetlist,
  parseSpiceNetlist,
} from "lib"

export function parsePspiceFixture(name: string): SpiceNetlist {
  const source = readFileSync(`tests/assets/${name}`, "utf8")
  const netlist = parseSpiceNetlist(source, { dialect: "pspice" })

  expect(netlist.dialect).toBe("pspice")
  expect(netlist.end).toBeDefined()
  expect(netlist.cards).not.toContainEqual(expect.any(UnknownDotCommand))
  expect(netlist.cards).not.toContainEqual(expect.any(UnknownElementCard))
  expect(netlist.cards).not.toContainEqual(expect.any(RawCard))
  expect(netlist.getString({ dialect: "pspice" })).toBe(source)

  return netlist
}
