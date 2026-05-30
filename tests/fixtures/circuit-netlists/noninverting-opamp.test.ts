import { expect, test } from "bun:test"
import { parseSpiceNetlist, tokenizeSpice } from "lib"

test("netlist: noninverting op-amp", () => {
  const netlist = `noninverting opamp v1 2 0 dc 5 rbogus 2 0 10k e 3 0 2 1 999k r1 3 1 20k r2 1 0 10k .end`

  const result = tokenizeSpice(netlist, { preserveWhitespace: true })

  expect(result.errors).toEqual([])
  expect(result.source.text).toBe(netlist)

  const parsed = parseSpiceNetlist(netlist)

  expect(parsed.getString()).toBe(netlist)
})
