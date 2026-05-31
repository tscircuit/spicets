import { expect, test } from "bun:test"
import { ControlBlock, parseSpiceCards } from "lib"

test("parses control blocks as a single card", () => {
  const [control] = parseSpiceCards(".control\nrun\nplot v(out)\n.endc\n")

  expect(control).toBeInstanceOf(ControlBlock)
  expect(control?.toSource({ format: "pretty" })).toBe(
    ".control\nrun\nplot v(out)\n.endc",
  )
})
