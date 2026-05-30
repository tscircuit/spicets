import { expect, test } from "bun:test"
import { parseSpiceNetlist, tokenizeSpice } from "lib"

test("netlist: common-base BJT transistor amplifier", () => {
  const netlist = `Common-base BJT amplifier vsupply 1 0 dc 24 vin 0 4 dc rc 1 2 800 re 3 4 100 q1 2 0 3 mod1 .model mod1 npn bf=50 .dc vin 0 5 0.1 .print dc v(2,3) .plot dc v(2,3) .end`

  const result = tokenizeSpice(netlist, { preserveWhitespace: true })

  expect(result.errors).toEqual([])
  expect(result.source.text).toBe(netlist)

  const parsed = parseSpiceNetlist(netlist)

  expect(parsed.getString()).toBe(netlist)
})
