import { expect, test } from "bun:test"
import { Model, Param, parseSpiceCard, Subckt } from "lib"

for (const value of [
  "{base * 2}",
  "'base + 2'",
  "{max(base, 2) + 1}",
  "sqrt(9)",
  "base+2",
  '"hello world"',
]) {
  test(`preserves parameter expression ${value}`, () => {
    const source = `.param result=${value} other=7`
    const card = parseSpiceCard(source) as Param
    expect(card.values.get("result")?.getString()).toBe(value)
    expect(card.values.get("other")?.getString()).toBe("7")
    expect(card.toSource({ format: "pretty" })).toBe(source)
    const reparsed = parseSpiceCard(
      card.toSource({ format: "pretty" }),
    ) as Param
    expect(reparsed.values.get("result")?.getString()).toBe(value)
  })
}

test("keeps function commas inside model values and outer separators outside", () => {
  const card = parseSpiceCard(".model D1 D (IS={max(a, b)}, N=2)") as Model
  expect(card.params.get("IS")?.getString()).toBe("{max(a, b)}")
  expect(card.params.get("N")?.getString()).toBe("2")
})

test("reads subcircuit parameter defaults without absorbing later assignments", () => {
  const card = parseSpiceCard(
    ".subckt cell a b params: gain={base * 2} offset=1\n.ends cell",
  ) as Subckt
  expect(card.params.get("gain")?.getString()).toBe("{base * 2}")
  expect(card.params.get("offset")?.getString()).toBe("1")
})

test("excludes trailing comments from a parameter value", () => {
  const card = parseSpiceCard(".param a={base + 1} ; note") as Param
  expect(card.values.get("a")?.getString()).toBe("{base + 1}")
})

test("retains whitespace and nested braces across continuation lines", () => {
  const card = parseSpiceCard(".param a={base +\n+ {other * 2}} b=7") as Param
  expect(card.values.get("a")?.getString().replace(/\s+/g, " ")).toBe(
    "{base + {other * 2}}",
  )
  expect(card.values.get("b")?.getString()).toBe("7")
  const reparsed = parseSpiceCard(card.toSource({ format: "pretty" })) as Param
  expect(reparsed.values.get("a")?.getString()).toBe(
    card.values.get("a")?.getString(),
  )
})

test("does not treat punctuation inside quoted strings as expression nesting", () => {
  const card = parseSpiceCard('.param text="x=(a,b) {" next=4') as Param
  expect(card.values.get("text")?.getString()).toBe('"x=(a,b) {"')
  expect(card.values.get("next")?.getString()).toBe("4")
})
