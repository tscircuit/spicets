import { expect, test } from "bun:test"
import { Tran, parseSpiceCard } from "lib"

for (const optional of ["", " 2us", " 2us 100ns"]) {
  for (const flag of ["UIC", "uic", "UiC"]) {
    test(`transient timing fields exclude ${flag} after${optional || " required fields"}`, () => {
      const source = `.tran 1us 10ms${optional} ${flag}`
      const card = parseSpiceCard(source) as Tran
      expect(card.uic).toBe(true)
      expect(card.start?.getString()).toBe(optional ? "2us" : undefined)
      expect(card.maxStep?.getString()).toBe(
        optional.includes("100ns") ? "100ns" : undefined,
      )
      expect(card.toSource()).toBe(source)
      expect(card.toSource({ format: "pretty" })).toBe(
        `.tran 1us 10ms${optional} UIC`,
      )
    })
  }
}

test("comments and continuation markers do not become transient timing fields", () => {
  const card = parseSpiceCard(
    ".tran 1us 10ms\n+ UIC ; skip operating point",
  ) as Tran
  expect(card.start).toBeUndefined()
  expect(card.maxStep).toBeUndefined()
  expect(card.toSource({ format: "pretty" })).toBe(".tran 1us 10ms UIC")
  const noFlag = parseSpiceCard(".tran 1us 10ms ; UIC is not enabled") as Tran
  expect(noFlag.uic).toBe(false)
  expect(noFlag.start).toBeUndefined()
  expect(noFlag.maxStep).toBeUndefined()
  expect(noFlag.toSource({ format: "pretty" })).toBe(".tran 1us 10ms")
})
