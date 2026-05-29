import { expect, test } from "bun:test"
import { Pulse, VoltageSource } from "lib"

test("authors a pulse source without evaluating SPICE values", () => {
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

  expect(source.toSource({ format: "pretty" })).toBe(
    "VCLK clk 0 PULSE(0 3.3 1ns 100ps 100ps 5ns 10ns)",
  )
})
