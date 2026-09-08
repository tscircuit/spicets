import { expect, test } from "bun:test"
import { Options, parseSpiceCard } from "lib"

for (const source of [
  ".options noacct",
  ".options klu savecurrents",
  ".options noacct reltol=0.005",
]) {
  test(`pretty formatting preserves flag options: ${source}`, () => {
    const card = parseSpiceCard(source) as Options
    expect(card).toBeInstanceOf(Options)
    expect(card.toSource()).toBe(source)
    expect(card.toSource({ format: "pretty" })).toBe(source)
  })
}

test("assigned option control retains its value", () => {
  const card = parseSpiceCard(".options reltol=0.005") as Options
  expect(card.values.get("reltol")?.getString()).toBe("0.005")
  expect(card.toSource({ format: "pretty" })).toBe(".options reltol=0.005")
})

for (const value of ["x+y", "x + y", "{max(x,y)}", '"random"', "max(x, y)"]) {
  test(`assignment expression is preserved separately from flags: ${value}`, () => {
    const card = parseSpiceCard(
      `.options noacct reltol=${value} savecurrents`,
    ) as Options
    expect(card.flags).toEqual(["noacct", "savecurrents"])
    expect(card.values.get("reltol")?.getString()).toBe(value)
    const again = parseSpiceCard(card.toSource({ format: "pretty" })) as Options
    expect(again.flags).toEqual(card.flags)
    expect(again.values.get("reltol")?.getString()).toBe(value)
  })
}

test("flags and values survive a continuation line in either order", () => {
  const card = parseSpiceCard(
    ".options reltol=0.005 noacct\n+ trtol=8 savecurrents",
  ) as Options
  expect(card.flags).toEqual(["noacct", "savecurrents"])
  expect(card.values.get("reltol")?.getString()).toBe("0.005")
  expect(card.values.get("trtol")?.getString()).toBe("8")
})

test("flag names can be authored and inspected alongside assigned values", () => {
  const card = new Options(
    { reltol: 0.005 },
    { flags: ["klu", "savecurrents"] },
  )
  const parsed = parseSpiceCard(card.toSource()) as Options
  expect(parsed.flags).toEqual(["klu", "savecurrents"])
  expect(parsed.values.get("reltol")?.getString()).toBe("0.005")
})

test("assignment values and comments do not become flags", () => {
  const card = parseSpiceCard(".options seed=random noacct ; klu") as Options
  expect(card.flags).toEqual(["noacct"])
  expect(card.values.get("seed")?.getString()).toBe("random")
  const quoted = parseSpiceCard('.options seed="random" noacct') as Options
  expect(quoted.flags).toEqual(["noacct"])
  const expression = parseSpiceCard(
    ".options reltol={max(x,y)} noacct",
  ) as Options
  expect(expression.flags).toEqual(["noacct"])
})
