import { expect, test } from "bun:test"
import { parseSpiceNetlist } from "lib"

test("preserves CRLF line endings", () => {
  const source = "* Windows netlist\r\nR1 in out 10k\r\n.end\r\n"
  const netlist = parseSpiceNetlist(source)

  expect(netlist.getString()).toBe(source)
})
