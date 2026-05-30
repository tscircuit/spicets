import { expect, test } from "bun:test"
import { parseSpiceNetlist, tokenizeSpice } from "lib"

test("netlist: AC sinewave voltage", () => {
  const netlist = `v1 1 0 sin(0 15 60 0 0) rload 1 0 10k * change tran card to the following for better Fourier precision * .tran 1m 30m .01m and include .options card: * .options itl5=30000 .tran 1m 30m .plot tran v(1) .four 60 v(1) .end`

  const result = tokenizeSpice(netlist, { preserveWhitespace: true })

  expect(result.errors).toEqual([])
  expect(result.source.text).toBe(netlist)

  const parsed = parseSpiceNetlist(netlist)

  expect(parsed.getString()).toBe(netlist)
})
