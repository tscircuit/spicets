import { expect, test } from "bun:test"
import { parseSpiceNetlist } from "lib"

test("preserves CRLF inside control blocks", () => {
  const source = "control demo\r\n.control\r\nrun\r\n.endc\r\n.end\r\n"
  const netlist = parseSpiceNetlist(source)

  expect(netlist.getString()).toBe(source)
})
