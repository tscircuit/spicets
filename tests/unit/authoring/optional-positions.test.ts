import { expect, test } from "bun:test"
import { CurrentSource, Pulse, Sin, Tran, VoltageSource } from "lib"

test("SIN phase keeps its position when delay and damping are omitted", () => {
  expect(
    new Sin({ offset: 0, amplitude: 1, frequency: "1k", phase: 90 }).toSource(),
  ).toBe("SIN(0 1 1k 0 0 90)")
})

test("SIN damping keeps its position when delay is omitted", () => {
  expect(
    new Sin({
      offset: 0,
      amplitude: 1,
      frequency: "1k",
      damping: 2,
    }).toSource(),
  ).toBe("SIN(0 1 1k 0 2)")
})

test("PULSE width and period keep their positions when transition times are omitted", () => {
  expect(
    new Pulse({ initial: 0, pulsed: 5, width: "1m", period: "2m" }).toSource(),
  ).toBe("PULSE(0 5 0 0 0 1m 2m)")
})

test("PULSE rise time keeps its position without a delay", () => {
  expect(new Pulse({ initial: 0, pulsed: 5, rise: "1n" }).toSource()).toBe(
    "PULSE(0 5 0 1n)",
  )
})

for (const Source of [VoltageSource, CurrentSource]) {
  test(`${Source.name} AC phase uses the default magnitude when omitted`, () => {
    expect(
      new Source({
        name: "SRC",
        nodes: ["in", "0"],
        ac: { phase: 90 },
      }).toSource({ format: "pretty" }),
    ).toBe("SRC in 0 AC 1 90")
  })
}

test("TRAN maximum step keeps its position without a start time", () => {
  expect(
    new Tran({ step: "1u", stop: "1m", maxStep: "100n", uic: true }).toSource({
      format: "pretty",
    }),
  ).toBe(".tran 1u 1m 0 100n UIC")
})

test("trailing optional arguments remain omitted", () => {
  expect(new Sin({ offset: 0, amplitude: 1, frequency: "1k" }).toSource()).toBe(
    "SIN(0 1 1k)",
  )
  expect(new Pulse({ initial: 0, pulsed: 5 }).toSource()).toBe("PULSE(0 5)")
  expect(
    new Tran({ step: "1u", stop: "1m" }).toSource({ format: "pretty" }),
  ).toBe(".tran 1u 1m")
  expect(
    new VoltageSource({ name: "V1", nodes: ["in", "0"], ac: {} }).toSource({
      format: "pretty",
    }),
  ).toBe("V1 in 0 AC")
})

test("explicit zero and raw symbolic values remain intact", () => {
  expect(
    new Sin({
      offset: 0,
      amplitude: "{amp}",
      frequency: "{freq}",
      delay: 0,
      phase: 0,
    }).toSource(),
  ).toBe("SIN(0 {amp} {freq} 0 0 0)")
  expect(
    new VoltageSource({
      name: "V1",
      nodes: ["in", "0"],
      ac: { magnitude: 0, phase: 90 },
    }).toSource({ format: "pretty" }),
  ).toBe("V1 in 0 AC 0 90")
})
