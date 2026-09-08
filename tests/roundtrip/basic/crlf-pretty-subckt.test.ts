import { expect, test } from "bun:test"
import { parseSpiceNetlist } from "lib"

test("pretty format keeps CRLF line endings inside a subckt block", () => {
  const source =
    ".subckt divider vin vout 0\r\nR1 vin vout 10k\r\nR2 vout 0 10k\r\n.ends divider\r\nV1 vin 0 DC 5\r\n.end\r\n"
  const netlist = parseSpiceNetlist(source)

  const pretty = netlist.getString({ format: "pretty" })

  expect(pretty).not.toMatch(/(?<!\r)\n/)
  expect(pretty.split("\r\n").join("\n")).not.toContain("\n\n")
})

test("pretty format keeps CRLF line endings inside a control block", () => {
  const source =
    ".control\r\nrun\r\nplot v(1)\r\n.endc\r\nR1 1 0 1k\r\n.end\r\n"
  const netlist = parseSpiceNetlist(source)

  const pretty = netlist.getString({ format: "pretty" })

  expect(pretty).not.toMatch(/(?<!\r)\n/)
})

test("pretty format keeps CRLF line endings inside a lib section", () => {
  const source = ".lib mylib tt\r\nR1 1 0 1k\r\n.endl\r\n.end\r\n"
  const netlist = parseSpiceNetlist(source)

  const pretty = netlist.getString({ format: "pretty" })

  expect(pretty).not.toMatch(/(?<!\r)\n/)
})
