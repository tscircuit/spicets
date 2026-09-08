import { test } from "bun:test"
import { strict as assert } from "node:assert"
import type { SpiceDialect, SpiceSerializeOptions } from "../lib/ast"
import { SpiceNetlist } from "../lib/roots/SpiceNetlist"
import { SpiceLibrary } from "../lib/roots/SpiceLibrary"
import { PspiceText } from "../lib/directives/PspiceText"

const roots = [
  {
    name: "netlist",
    create: (dialect: SpiceDialect) =>
      new SpiceNetlist({
        dialect,
        cards: [new PspiceText(["note"])],
        end: false,
        trailingNewline: false,
      }),
  },
  {
    name: "library",
    create: (dialect: SpiceDialect) =>
      new SpiceLibrary({
        dialect,
        cards: [new PspiceText(["note"])],
        trailingNewline: false,
      }),
  },
]

const inheritedOptions: Array<SpiceSerializeOptions | undefined> = [
  undefined,
  { format: "pretty" },
  { dialect: undefined },
]

for (const { name, create } of roots) {
  for (const options of inheritedOptions) {
    test(`${name} inherits its dialect with ${JSON.stringify(options)}`, () => {
      assert.equal(create("pspice").getString(options), ".TEXT note")
    })
  }

  test(`${name} still rejects an explicit incompatible target`, () => {
    assert.throws(
      () => create("pspice").getString({ dialect: "ngspice" }),
      /target dialect "ngspice"/,
    )
  })

  test(`${name} permits an explicit PSpice target override`, () => {
    assert.equal(
      create("generic").getString({ dialect: "pspice" }),
      ".TEXT note",
    )
  })

  test(`${name} does not modify caller-owned options`, () => {
    const options = Object.freeze({ format: "pretty" as const })
    const document = create("pspice")
    assert.equal(document.getString(options), ".TEXT note")
    assert.deepEqual(options, { format: "pretty" })
    assert.equal(document.dialect, "pspice")
  })
}
