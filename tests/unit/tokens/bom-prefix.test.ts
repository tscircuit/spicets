import { expect, test } from "bun:test"
import {
  Resistor,
  Model,
  parseSpiceCard,
  parseSpiceNetlist,
  tokenizeSpice,
} from "lib"

test("a leading BOM does not become part of an element name", () => {
  const source = "\uFEFFR1 a 0 1k"
  const card = parseSpiceCard(source)
  expect(card).toBeInstanceOf(Resistor)
  expect((card as Resistor).name).toBe("R1")
  expect(card.toSource()).toBe(source)
  expect(card.toSource({ format: "pretty" })).toBe("R1 a 0 1k")
  const netlist = parseSpiceNetlist(`${source}\n.end\n`)
  expect(netlist.elements).toHaveLength(1)
  expect(netlist.toSource()).toBe(`${source}\n.end\n`)
})

test("BOM-prefixed directives and comments retain their classes", () => {
  const model = parseSpiceCard("\uFEFF.model DM D (IS=1n)")
  expect(model).toBeInstanceOf(Model)
  const comment = parseSpiceCard("\uFEFF* comment")
  expect(comment.type).toBe("comment")
  expect(comment.toSource()).toBe("\uFEFF* comment")
})

test("token ranges include the BOM offset and whitespace options control retention", () => {
  const kept = tokenizeSpice("\uFEFFR1 a 0 1k", {
    preserveWhitespace: true,
  }).tokens
  expect(kept[0]?.type).toBe("whitespace")
  expect(kept[0]?.raw).toBe("\uFEFF")
  expect(kept[1]?.range.start.offset).toBe(1)
  expect(tokenizeSpice("\uFEFFR1 a 0 1k").tokens[0]?.raw).toBe("R1")
})
