import { expect, test } from "bun:test"
import { Bjt, Diode, Mosfet, parseSpiceCard } from "lib"

test("parses semiconductor cards into specific classes", () => {
  expect(parseSpiceCard("D1 an cath DFAST")).toBeInstanceOf(Diode)
  expect(parseSpiceCard("Q1 c b e QNPN")).toBeInstanceOf(Bjt)
  expect(parseSpiceCard("M1 d g s b NMOS L=1u W=2u")).toBeInstanceOf(Mosfet)
})

test("preserves a MOSFET's bare OFF flag in pretty netlists", () => {
  const input = "M1 d g s b NMOS L=5u off W=10u"
  const mosfet = parseSpiceCard(input) as Mosfet

  expect(mosfet.toSource()).toBe(input)
  expect(mosfet.toSource({ format: "pretty" })).toBe(
    "M1 d g s b NMOS OFF L=5u W=10u",
  )
})

test("does not treat MOSFET nodes, models, or parameter values as OFF flags", () => {
  for (const input of [
    "M1 off g s b NMOS L=5u",
    "M1 d g s b off L=5u",
    "M1 d g s b NMOS W=off",
    "M1 d g s b NMOS W={ off }",
  ]) {
    const mosfet = parseSpiceCard(input) as Mosfet
    expect(mosfet.toSource({ format: "pretty" })).not.toContain(" OFF")
  }
})
