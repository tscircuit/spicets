import { expect, test } from "bun:test"
import { CurrentSource, VoltageSource } from "lib"

test("serializes source cards with DC and AC specs", () => {
  expect(
    new VoltageSource({
      name: "V1",
      nodes: ["in", "0"],
      dc: 5,
      ac: { magnitude: 1, phase: 90 },
    }).toSource({ format: "pretty" }),
  ).toBe("V1 in 0 DC 5 AC 1 90")
  expect(
    new CurrentSource({
      name: "I1",
      nodes: ["out", "0"],
      dc: "1m",
    }).toSource({ format: "pretty" }),
  ).toBe("I1 out 0 DC 1m")
})
