import { expect, test } from "bun:test"
import { parseSpiceNetlist, tokenizeSpice } from "lib"

test("netlist: low-pass filter", () => {
  const netlist = `Lowpass filter v1 2 1 ac 24 sin v2 1 0 dc 24 rload 4 0 1k l1 2 3 100m l2 3 4 250m c1 3 0 100u .ac lin 30 500 15k .print ac v(4) .plot ac v(4) .end`

  const result = tokenizeSpice(netlist, { preserveWhitespace: true })

  expect(result.errors).toEqual([])
  expect(result.source.text).toBe(netlist)

  const parsed = parseSpiceNetlist(netlist)

  expect(parsed.getString()).toBe(netlist)
})
