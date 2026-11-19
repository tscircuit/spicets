import { expect, test } from "bun:test"
import { Model, parseSpiceNetlist } from "lib"

test("braced switch-model parameters survive parsing and serialization", () => {
  const netlist = parseSpiceNetlist(`* Parameterized regulator isolation switch
.param mode=1
.model isolation VSWITCH (
+ RON={max(1e6, 1)} ROFF={1e3 * (2 + 3)}
+ VON={if({mode} > 0, 1m, 2m)} VOFF=0)
`)
  const model = netlist.cards.find((card) => card instanceof Model)
  if (!model) throw new Error("Missing isolation switch model")

  expect({
    parameters: model.params
      .entries()
      .map(([name, expression]) => [name, expression.getString()]),
    serialized: model.toSource({ format: "pretty" }),
  }).toMatchSnapshot()
})
