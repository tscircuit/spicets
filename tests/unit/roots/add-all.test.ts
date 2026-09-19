import { expect, test } from "bun:test"
import { SpiceNetlist } from "lib"
import { BlankLine } from "lib/trivia/BlankLine"

test("addAll appends 180,000 cards without overflowing the argument limit", () => {
  const netlist = new SpiceNetlist()
  const cards = Array.from({ length: 180_000 }, () => new BlankLine())

  netlist.addAll(cards)

  expect(netlist.cards.length).toBe(180_000)
  expect(netlist.cards[0]).toBe(cards[0])
  expect(netlist.cards[179_999]).toBe(cards[179_999])
})

test("addAll self-append terminates with doubled contents", () => {
  const netlist = new SpiceNetlist({
    cards: [new BlankLine(), new BlankLine()],
  })

  netlist.addAll(netlist.cards)

  expect(netlist.cards.length).toBe(4)
  for (const card of netlist.cards) expect(card).toBeInstanceOf(BlankLine)
})

test("addAll on an empty input leaves cards untouched", () => {
  const existing = new BlankLine()
  const netlist = new SpiceNetlist({ cards: [existing] })

  netlist.addAll([])

  expect(netlist.cards).toEqual([existing])
})
