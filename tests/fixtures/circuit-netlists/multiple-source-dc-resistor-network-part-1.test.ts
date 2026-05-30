import { expect, test } from "bun:test"
import { parseSpiceNetlist, tokenizeSpice } from "lib"

test("netlist: multiple-source DC resistor network part 1", () => {
  const netlist = `Multiple dc sources v1 1 0 dc 24 v2 3 0 dc 15 r1 1 2 10k r2 2 3 8.1k r3 2 0 4.7k .end`

  const result = tokenizeSpice(netlist, { preserveWhitespace: true })

  expect(result.errors).toEqual([])
  expect(result.source.text).toBe(netlist)

  const parsed = parseSpiceNetlist(netlist)

  expect(parsed.getString()).toBe(netlist)
})
