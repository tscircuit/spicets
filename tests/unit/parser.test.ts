import { expect, test } from "bun:test"
import {
  SpiceDirective,
  SpiceElement,
  UnknownSpiceLine,
  parseSpiceLines,
  parseSpiceNetlist,
} from "../../index"

test("parses root netlists with typed children", () => {
  const netlist = parseSpiceNetlist("R1 in out 10k\n.op\n")

  expect(netlist.getChildren()).toHaveLength(2)
  expect(netlist.lines[0]).toBeInstanceOf(SpiceElement)
  expect(netlist.lines[1]).toBeInstanceOf(SpiceDirective)
})

test("preserves unmodeled lines as unknown tokens", () => {
  const [line] = parseSpiceLines("#include vendor-models.inc")

  expect(line).toBeInstanceOf(UnknownSpiceLine)
  expect(line?.toSource()).toBe("#include vendor-models.inc")
})

test("serializes hand-authored netlists deterministically", () => {
  const netlist = parseSpiceNetlist("")
  netlist.lines.push(
    new SpiceElement({
      name: "Rload",
      nodes: ["out", "0"],
      value: "10k",
      parameters: ["temp=25"],
    }),
  )
  netlist.lines.push(new SpiceDirective({ name: ".end" }))

  expect(netlist.getString()).toBe("Rload out 0 10k temp=25\n.end")
})
