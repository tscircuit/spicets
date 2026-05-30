import { expect, test } from "bun:test"
import { Subckt, parseSpiceCard } from "lib"

test("parses subckt params through token punctuation", () => {
  const card = parseSpiceCard(".subckt divider vin vout 0 params: rtop=10k rbot=20k")

  expect(card).toBeInstanceOf(Subckt)
  const subckt = card as Subckt
  expect(subckt.name).toBe("divider")
  expect(subckt.pins.map((pin) => pin.getString())).toEqual(["vin", "vout", "0"])
  expect(subckt.params.get("rtop")?.getString()).toBe("10k")
  expect(subckt.params.get("rbot")?.getString()).toBe("20k")
})
