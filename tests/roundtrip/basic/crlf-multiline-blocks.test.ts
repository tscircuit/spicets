import { expect, test } from "bun:test"
import { parseSpiceNetlist } from "lib"

test("pretty format preserves CRLF line endings throughout .subckt blocks", () => {
  const source =
    ".subckt DIVIDER in out gnd\r\nR1 in out 10k\r\nR2 out gnd 10k\r\n.ends DIVIDER\r\n"

  const netlist = parseSpiceNetlist(source)
  const pretty = netlist.getString({ format: "pretty" })

  expect(netlist.lineEnding).toBe("\r\n")
  expect(pretty).toBe(
    ".subckt DIVIDER in out gnd\r\nR1 in out 10k\r\nR2 out gnd 10k\r\n.ends DIVIDER\r\n",
  )

  // Verify there are no bare LF characters (every \n must be preceded by \r)
  const bareLf = pretty.replace(/\r\n/g, "").includes("\n")
  expect(bareLf).toBe(false)
})

test("pretty format preserves CRLF line endings throughout .control blocks", () => {
  const source = "control demo\r\n.control\r\nrun\r\n.endc\r\n.end\r\n"

  const netlist = parseSpiceNetlist(source)
  const pretty = netlist.getString({ format: "pretty" })

  expect(netlist.lineEnding).toBe("\r\n")
  const bareLf = pretty.replace(/\r\n/g, "").includes("\n")
  expect(bareLf).toBe(false)
  expect(pretty).toContain(".control\r\nrun\r\n.endc")
})
