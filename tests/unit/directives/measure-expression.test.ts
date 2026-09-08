import { expect, test } from "bun:test"
import { Measure, parseSpiceCard } from "lib"

for (const expression of [
  "param='fval + 7'",
  "param='(tdiff < limit) ? 1 : 0'",
]) {
  test(`measurement retains a quoted expression: ${expression}`, () => {
    const source = `.measure tran result ${expression}`
    const card = parseSpiceCard(source) as Measure
    expect(card.expression).toBe(expression)
    expect(card.toSource({ format: "pretty" })).toBe(source)
  })
}

test("measurement retains punctuation and discards continuation markers and comments", () => {
  const card = parseSpiceCard(
    ".measure tran delay TRIG v(1,2) VAL=0.5\n+ TARG v(3) VAL=0.5 ; explanation",
  ) as Measure
  expect(card.expression).toBe("TRIG v(1,2) VAL=0.5 TARG v(3) VAL=0.5")
  const again = parseSpiceCard(card.toSource({ format: "pretty" })) as Measure
  expect(again.expression).toBe(card.expression)
})
