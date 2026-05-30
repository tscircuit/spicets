import { expect, test } from "bun:test"
import { tokenizeSpice } from "lib"

test("tokens preserve raw source text and source ranges", () => {
  const result = tokenizeSpice("R1 in out 10k\n", { preserveWhitespace: false })
  const [resistor, inputNode, outputNode, resistance] = result.tokens

  expect(resistor?.range.start).toEqual({ offset: 0, line: 1, column: 1 })
  expect(resistor?.range.end).toEqual({ offset: 2, line: 1, column: 3 })
  expect(inputNode?.raw).toBe("in")
  expect(outputNode?.raw).toBe("out")
  expect(resistance).toMatchObject({
    type: "number",
    raw: "10k",
    unitSuffix: "k",
    value: 10000,
  })
})
