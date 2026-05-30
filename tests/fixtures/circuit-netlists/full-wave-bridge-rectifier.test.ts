import { expect, test } from "bun:test"
import { parseSpiceNetlist, tokenizeSpice } from "lib"

test("netlist: full-wave bridge rectifier", () => {
  const netlist = `fullwave bridge rectifier v1 1 0 sin(0 15 60 0 0) rload 1 0 10k d1 1 2 mod1 d2 0 2 mod1 d3 3 1 mod1 d4 3 0 mod1 .model mod1 d .tran .5m 25m .plot tran v(1,0) v(2,3) .end`

  const result = tokenizeSpice(netlist, { preserveWhitespace: true })

  expect(result.errors).toEqual([])
  expect(result.source.text).toBe(netlist)

  const parsed = parseSpiceNetlist(netlist)

  expect(parsed.getString()).toBe(netlist)
})
