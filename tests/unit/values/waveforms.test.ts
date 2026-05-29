import { expect, test } from "bun:test"
import { Pwl, Sin } from "lib"

test("serializes SIN and PWL source waveforms", () => {
  expect(
    new Sin({
      offset: 0,
      amplitude: 1,
      frequency: "1k",
      delay: "1m",
    }).toSource(),
  ).toBe("SIN(0 1 1k 1m)")
  expect(
    new Pwl([
      [0, 0],
      ["1ns", 3.3],
    ]).toSource(),
  ).toBe("PWL(0 0 1ns 3.3)")
})
