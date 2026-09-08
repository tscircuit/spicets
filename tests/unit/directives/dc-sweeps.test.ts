import { expect, test } from "bun:test"
import { Dc, parseSpiceCard } from "lib"

test("nested DC sweep retains both sources and their ranges", () => {
  const source = ".dc V1 0 5 0.5 V2 1 3 1"
  const card = parseSpiceCard(source) as Dc
  expect(
    card.sweeps.map((sweep) => ({
      source: sweep.source,
      start: sweep.start.getString(),
      stop: sweep.stop.getString(),
      step: sweep.step.getString(),
    })),
  ).toEqual([
    { source: "V1", start: "0", stop: "5", step: "0.5" },
    { source: "V2", start: "1", stop: "3", step: "1" },
  ])
  expect(card.toSource()).toBe(source)
  expect(card.toSource({ format: "pretty" })).toBe(source)
})

test("constructed nested sweep survives serialization and parsing", () => {
  const authored = new Dc({
    sweeps: [
      { source: "Vbias", start: 0, stop: 5, step: 1 },
      { source: "Ibias", start: "1u", stop: "10u", step: "1u" },
    ],
  })
  const parsed = parseSpiceCard(authored.toSource()) as Dc
  expect(parsed.sweeps).toHaveLength(2)
  expect(parsed.sweeps[1]?.source).toBe("Ibias")
  expect(parsed.sweeps[1]?.step.getString()).toBe("1u")
  expect(parsed.toSource({ format: "pretty" })).toBe(authored.toSource())
})

test("single sweep and continued second sweep preserve their fields", () => {
  const single = parseSpiceCard(".dc V1 0 5 1") as Dc
  expect(single.sweeps).toHaveLength(1)
  expect(single.toSource({ format: "pretty" })).toBe(".dc V1 0 5 1")
  const continued = parseSpiceCard(".dc V1 0 5 1\n+ V2 1 3 1") as Dc
  expect(continued.sweeps).toHaveLength(2)
  expect(continued.toSource({ format: "pretty" })).toBe(".dc V1 0 5 1 V2 1 3 1")
})
