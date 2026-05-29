import { expect, test } from "bun:test"
import { Cccs, Ccvs, SubcktInstance, Vccs, Vcvs, parseSpiceCard } from "lib"

test("parses controlled sources and subckt instances into specific classes", () => {
  expect(parseSpiceCard("E1 out 0 in 0 10")).toBeInstanceOf(Vcvs)
  expect(parseSpiceCard("G1 out 0 in 0 1m")).toBeInstanceOf(Vccs)
  expect(parseSpiceCard("H1 out 0 VSENSE 10")).toBeInstanceOf(Ccvs)
  expect(parseSpiceCard("F1 out 0 VSENSE 2")).toBeInstanceOf(Cccs)
  expect(parseSpiceCard("X1 in out 0 divider")).toBeInstanceOf(SubcktInstance)
})
