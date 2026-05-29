import { expect, test } from "bun:test"
import {
  BlankLine,
  Op,
  Param,
  Pulse,
  RawCard,
  Resistor,
  SpiceNetlist,
  Tran,
  UnknownDotCommand,
  VoltageSource,
  parseSpiceCards,
  parseSpiceNetlist,
} from "../../index"

test("parses root netlists with ordered typed cards", () => {
  const netlist = parseSpiceNetlist("R1 in out 10k\n.op\n")

  expect(netlist.getChildren()).toHaveLength(2)
  expect(netlist.cards[0]).toBeInstanceOf(Resistor)
  expect(netlist.cards[1]).toBeInstanceOf(Op)
})

test("preserves unknown syntax as specific raw or unknown cards", () => {
  const [raw, unknown] = parseSpiceCards("#include vendor-models.inc\n.foo bar")

  expect(raw).toBeInstanceOf(RawCard)
  expect(raw?.toSource()).toBe("#include vendor-models.inc")
  expect(unknown).toBeInstanceOf(UnknownDotCommand)
  expect(unknown?.toSource()).toBe(".foo bar")
})

test("serializes hand-authored netlists with specific card classes", () => {
  const netlist = new SpiceNetlist({
    title: "RC low-pass",
    cards: [
      new VoltageSource({
        name: "V1",
        nodes: ["vin", "0"],
        dc: 5,
      }),
      new Resistor({
        name: "Rload",
        nodes: ["vin", "0"],
        resistance: "10k",
        params: { temp: 25 },
      }),
      new Tran({ step: "1us", stop: "10ms" }),
    ],
    trailingNewline: false,
  })

  expect(netlist.getString({ format: "pretty" })).toBe(
    "RC low-pass\nV1 vin 0 DC 5\nRload vin 0 10k temp=25\n.tran 1us 10ms\n.end",
  )
})

test("normalizes ergonomic waveform and param inputs", () => {
  const source = new VoltageSource({
    name: "VCLK",
    nodes: ["clk", "0"],
    transient: new Pulse({
      initial: 0,
      pulsed: 3.3,
      delay: "1ns",
      rise: "100ps",
      fall: "100ps",
      width: "5ns",
      period: "10ns",
    }),
  })
  const param = new Param({ rload: "{base_r * 2}" })

  expect(source.toSource({ format: "pretty" })).toBe(
    "VCLK clk 0 PULSE(0 3.3 1ns 100ps 100ps 5ns 10ns)",
  )
  expect(param.toSource({ format: "pretty" })).toBe(".param rload={base_r * 2}")
})

test("keeps blank lines as cards for source-order round trips", () => {
  const [blank] = parseSpiceCards(" \n")

  expect(blank).toBeInstanceOf(BlankLine)
})
