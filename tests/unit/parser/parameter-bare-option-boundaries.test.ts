import { expect, test } from "bun:test"
import { Options, parseSpiceCard } from "lib"

test("does not absorb interp into reltol", () => {
  const card = parseSpiceCard(".options reltol=0.001 interp") as Options

  expect(card.values.get("reltol")?.getString()).toBe("0.001")
  expect(card.toSource()).toBe(".options reltol=0.001 interp")
})

for (const expression of [
  "0.001",
  "tolerance",
  "{max(base, 0.001)}",
  "'base + 0.001'",
  "sqrt (0.000001)",
  "base + 0.001",
  "base +0.001",
  "base > 0 ? 0.001 : 0.002",
]) {
  test(`separates bare options after parameter expression ${expression}`, () => {
    const source = `.options noacct method=gear reltol=${expression} interp brief vntol=1u`
    const card = parseSpiceCard(source) as Options

    expect(card.values.get("method")?.getString()).toBe("gear")
    expect(card.values.get("reltol")?.getString()).toBe(expression)
    expect(card.values.get("vntol")?.getString()).toBe("1u")
    expect(card.toSource()).toBe(source)
  })
}

test("separates a bare option on a continuation line", () => {
  const card = parseSpiceCard(
    ".options reltol=0.001\n+ interp vntol=1u",
  ) as Options

  expect(card.values.get("reltol")?.getString()).toBe("0.001")
  expect(card.values.get("vntol")?.getString()).toBe("1u")
})
