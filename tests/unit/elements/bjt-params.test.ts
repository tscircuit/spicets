import { expect, test } from "bun:test"
import { Bjt, parseSpiceCard } from "lib"

for (const source of [
  "Q1 c b e QNPN m=2",
  "Q1 c b e QNPN temp=40",
  "Q1 c b e QNPN area=2 m=3",
]) {
  test(`BJT parameters do not become substrate and model: ${source}`, () => {
    const card = parseSpiceCard(source) as Bjt
    const actual = {
      nodes: card.nodes.map((node) => node.getString()),
      model: card.model,
      params: card.params.getString(),
      pretty: card.toSource({ format: "pretty" }),
    }
    expect(card).toBeInstanceOf(Bjt)
    expect(actual.nodes).toEqual(["c", "b", "e"])
    expect(actual.model).toBe("QNPN")
    expect(actual.pretty).toBe(source)
  })
}

test("explicit substrate remains distinct from model and parameters", () => {
  const card = parseSpiceCard("Q1 c b e sub QNPN m=2") as Bjt
  expect(card.nodes.map((node) => node.getString())).toEqual([
    "c",
    "b",
    "e",
    "sub",
  ])
  expect(card.model).toBe("QNPN")
  expect(card.params.get("m")?.getString()).toBe("2")
})
