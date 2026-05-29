import { expect, test } from "bun:test"
import { readFileSync } from "node:fs"
import { parseSpiceNetlist } from "lib"

test("round-trips a basic SPICE netlist", () => {
  const source = readFileSync("tests/fixtures/basic.cir", "utf8")
  const netlist = parseSpiceNetlist(source)

  expect(netlist.getString()).toBe(source)
})
