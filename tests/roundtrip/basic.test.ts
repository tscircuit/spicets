import { expect, test } from "bun:test"
import { readFileSync } from "node:fs"
import { parseSpiceNetlist } from "../../index"

test("round-trips a basic SPICE netlist", () => {
  const source = readFileSync("tests/fixtures/basic.cir", "utf8")
  const netlist = parseSpiceNetlist(source)

  expect(netlist.getString()).toBe(source)
})

test("preserves CRLF line endings", () => {
  const source = "* Windows netlist\r\nR1 in out 10k\r\n.end\r\n"
  const netlist = parseSpiceNetlist(source)

  expect(netlist.getString()).toBe(source)
})
