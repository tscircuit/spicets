import { expect, test } from "bun:test"
import { BlankLine, parseSpiceCards } from "lib"

test("keeps blank lines as cards for source-order round trips", () => {
  const [blank] = parseSpiceCards(" \n")

  expect(blank).toBeInstanceOf(BlankLine)
})
