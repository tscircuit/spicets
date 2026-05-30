import { expect, test } from "bun:test"
import { parseSpiceNetlist, tokenizeSpice } from "lib"

test("netlist: RC time-constant", () => {
  const netlist = `RC time delay v1 1 0 dc 10 c1 1 2 47u ic=0 c2 1 2 22u ic=0 r1 2 0 3.3k .tran .05 1 uic .print tran v(1,2) .end`

  const result = tokenizeSpice(netlist, { preserveWhitespace: true })

  expect(result.errors).toEqual([])
  expect(result.source.text).toBe(netlist)

  const parsed = parseSpiceNetlist(netlist)

  expect(parsed.getString()).toBe(netlist)
})
