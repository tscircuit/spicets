import { test } from "bun:test"
import { strict as assert } from "node:assert"
import { SpiceNetlist } from "../lib/roots/SpiceNetlist"
import { BlankLine } from "../lib/trivia/BlankLine"

for (const count of [4, 180_000]) {
  test(`addAll preserves ${count} card identities and destination identity`, () => {
    const first = new BlankLine({ originalSource: " " })
    const netlist = new SpiceNetlist({ cards: [first] })
    const destination = netlist.cards
    const cards = Array.from({ length: count }, () => new BlankLine())
    netlist.addAll(cards)
    assert.equal(netlist.cards, destination)
    assert.equal(netlist.cards.length, count + 1)
    assert.equal(netlist.cards[0], first)
    for (let i = 0; i < count; i++) {
      assert.equal(netlist.cards[i + 1], cards[i])
    }
    assert.equal(cards.length, count)
  })
}

test("addAll with an empty input does not change the destination", () => {
  const card = new BlankLine()
  const netlist = new SpiceNetlist({ cards: [card] })
  const destination = netlist.cards
  netlist.addAll([])
  assert.equal(netlist.cards, destination)
  assert.deepEqual(netlist.cards, [card])
})

test("addAll captures the original length when appending its own cards", () => {
  const first = new BlankLine({ originalSource: " " })
  const second = new BlankLine({ originalSource: "  " })
  const netlist = new SpiceNetlist({ cards: [first, second] })
  const destination = netlist.cards
  netlist.addAll(netlist.cards)
  assert.equal(netlist.cards, destination)
  assert.deepEqual(netlist.cards, [first, second, first, second])
})
