import { expect, test } from "bun:test"
import { parseSpiceNetlist, tokenizeSpice } from "lib"

test("netlist: common-source JFET amplifier with self-bias", () => {
  const netlist = `common source jfet amplifier vin 1 0 sin(0 1 60 0 0) vdd 3 0 dc 20 rdrain 3 2 10k rsource 4 0 1k j1 2 1 4 mod1 .model mod1 njf .tran 1m 30m .plot tran v(2,0) v(1,0) .end`

  const result = tokenizeSpice(netlist, { preserveWhitespace: true })

  expect(result.errors).toEqual([])
  expect(result.source.text).toBe(netlist)

  const parsed = parseSpiceNetlist(netlist)

  expect(parsed.getString()).toBe(netlist)
})
