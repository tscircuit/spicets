import { expect, test } from "bun:test"
import { Cccs, Ccvs, Vccs, Vcvs } from "lib"

test("serializes controlled sources and subckt instances", () => {
  expect(
    new Vcvs({
      name: "E1",
      output: ["out", "0"],
      control: ["in", "0"],
      gain: 10,
    }).toSource({ format: "pretty" }),
  ).toBe("E1 out 0 in 0 10")
  expect(
    new Vccs({
      name: "G1",
      output: ["out", "0"],
      control: ["in", "0"],
      transconductance: "1m",
    }).toSource({ format: "pretty" }),
  ).toBe("G1 out 0 in 0 1m")
  expect(
    new Ccvs({
      name: "H1",
      output: ["out", "0"],
      source: "VSENSE",
      transresistance: 10,
    }).toSource({ format: "pretty" }),
  ).toBe("H1 out 0 VSENSE 10")
  expect(
    new Cccs({
      name: "F1",
      output: ["out", "0"],
      source: "VSENSE",
      gain: 2,
    }).toSource({ format: "pretty" }),
  ).toBe("F1 out 0 VSENSE 2")
})
