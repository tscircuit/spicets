import { expect, test } from "bun:test"
import { parseSpiceNetlist, tokenizeSpice } from "lib"

test("netlist: op-amp integrator with sinewave input", () => {
  const netlist = `Integrator with sinewave input vin 1 0 sin (0 15 60 0 0) r1 1 2 10k c1 2 3 150u ic=0 e 3 0 0 2 999k .tran 1m 30m uic .plot tran v(1,0) v(3,0) .end`

  const result = tokenizeSpice(netlist, { preserveWhitespace: true })

  expect(result.errors).toEqual([])
  expect(result.source.text).toBe(netlist)

  const parsed = parseSpiceNetlist(netlist)

  expect(parsed.getString()).toBe(netlist)
})
