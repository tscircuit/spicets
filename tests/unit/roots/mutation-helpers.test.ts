import { expect, test } from "bun:test"
import { BlankLine, Op, SpiceNetlist, Tran } from "lib"

test("supports add and addAll mutation", () => {
  const netlist = new SpiceNetlist({ end: false, trailingNewline: false })
  const addResult = netlist.add(new Op())
  const addAllResult = netlist.addAll([new Tran({ step: "1n", stop: "1u" })])

  expect(addResult).toBeUndefined()
  expect(addAllResult).toBeUndefined()
  expect(netlist.getString({ format: "pretty" })).toBe(".op\n.tran 1n 1u")
})

test("supports addAll with large card arrays and self-append", () => {
  const netlist = new SpiceNetlist({ end: false })
  const cards = Array.from({ length: 180_000 }, () => new BlankLine())
  netlist.addAll(cards)
  expect(netlist.cards).toHaveLength(180_000)

  const selfNetlist = new SpiceNetlist({
    end: false,
    cards: [new Op(), new Tran({ step: "1n", stop: "1u" })],
  })
  selfNetlist.addAll(selfNetlist.cards)
  expect(selfNetlist.cards).toHaveLength(4)
})
