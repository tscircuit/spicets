import { expect, test } from "bun:test"
import { Ac, Dc, Op, Tran, parseSpiceCard } from "lib"

test("parses analysis commands into specific classes", () => {
  expect(parseSpiceCard(".op")).toBeInstanceOf(Op)
  expect(parseSpiceCard(".tran 1us 10ms")).toBeInstanceOf(Tran)
  expect(parseSpiceCard(".ac dec 10 1 1meg")).toBeInstanceOf(Ac)
  expect(parseSpiceCard(".dc V1 0 5 0.1")).toBeInstanceOf(Dc)
})
