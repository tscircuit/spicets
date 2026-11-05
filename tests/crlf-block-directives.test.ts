import { describe, expect, test } from "bun:test"
import { parseSpiceNetlist } from "lib/parser"

const CRLF_SOURCE = [
  "Test CRLF",
  ".subckt DIV a b params: r=1k",
  "R1 a mid 1k",
  "R2 mid b 1k",
  ".ends DIV",
  ".control",
  "op",
  "print v(a)",
  ".endc",
  ".end",
].join("\r\n")

describe("CRLF round-trip", () => {
  test("pretty round-trip preserves CRLF in multi-line blocks", () => {
    const netlist = parseSpiceNetlist(CRLF_SOURCE)
    const out = netlist.toSource({ format: "pretty" })
    expect(out).toBe(CRLF_SOURCE)
  })

  test("subckt block uses CRLF, not bare LF", () => {
    const netlist = parseSpiceNetlist(CRLF_SOURCE)
    const out = netlist.toSource({ format: "pretty" })
    const subcktPart = out.slice(out.indexOf(".subckt"), out.indexOf(".ends"))
    expect(subcktPart).toContain("\r\n")
    expect(subcktPart).not.toContain("\n")
  })

  test("control block uses CRLF", () => {
    const netlist = parseSpiceNetlist(CRLF_SOURCE)
    const out = netlist.toSource({ format: "pretty" })
    const ctrlPart = out.slice(out.indexOf(".control"), out.indexOf(".endc"))
    expect(ctrlPart).toContain("\r\n")
    expect(ctrlPart).not.toContain("\n")
  })

  test("LF source keeps LF", () => {
    const netlist = parseSpiceNetlist(CRLF_SOURCE.replace(/\r\n/g, "\n"))
    const out = netlist.toSource({ format: "pretty" })
    expect(out).toBe(CRLF_SOURCE.replace(/\r\n/g, "\n"))
  })
})
