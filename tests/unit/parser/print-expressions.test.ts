import { expect, test } from "bun:test"
import { parseSpiceNetlist, Print } from "../../../lib"

for (const [source, expressions] of [
  [".print dc V(1,2) I(V1)", ["V(1,2)", "I(V1)"]],
  [".print dc V(1,2), I(V1)", ["V(1,2)", "I(V1)"]],
  [".print dc V(1) V(2)", ["V(1)", "V(2)"]],
  [".print dc V(1, 2)\tI(V1)", ["V(1, 2)", "I(V1)"]],
  [".print dc V(1), I(V1)", ["V(1)", "I(V1)"]],
  [".print dc {max(V(1), V(2))} V(3)", ["{max(V(1), V(2))}", "V(3)"]],
  [".print dc 'V(1) + V(2)' I(V1)", ["'V(1) + V(2)'", "I(V1)"]],
  [".print dc", []],
] as const) {
  test(`separates complete print expressions: ${source}`, () => {
    const card = parseSpiceNetlist(`${source}\n`).directives[0] as Print
    expect(card).toBeInstanceOf(Print)
    expect(card.expressions).toEqual([...expressions])
    expect(card.toSource()).toBe(source)
    const reparsed = parseSpiceNetlist(card.toSource({ format: "pretty" }))
      .directives[0] as Print
    expect(reparsed.expressions).toEqual([...expressions])
  })
}
