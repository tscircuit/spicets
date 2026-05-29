import { expect, test } from "bun:test"
import { Bjt, Diode, Mosfet, parseSpiceCard } from "lib"

test("parses semiconductor cards into specific classes", () => {
  expect(parseSpiceCard("D1 an cath DFAST")).toBeInstanceOf(Diode)
  expect(parseSpiceCard("Q1 c b e QNPN")).toBeInstanceOf(Bjt)
  expect(parseSpiceCard("M1 d g s b NMOS L=1u W=2u")).toBeInstanceOf(Mosfet)
})
