import { expect, test } from "bun:test"
import { Ac, Dc, Op, Tran } from "lib"

test("serializes analysis commands", () => {
  expect(new Op().toSource({ format: "pretty" })).toBe(".op")
  expect(
    new Tran({ step: "1us", stop: "10ms", start: 0, maxStep: "10us", uic: true })
      .toSource({ format: "pretty" }),
  ).toBe(".tran 1us 10ms 0 10us UIC")
  expect(new Ac({ sweep: "dec", points: 10, start: 1, stop: "1meg" }).toSource({ format: "pretty" }))
    .toBe(".ac dec 10 1 1meg")
  expect(new Dc({ source: "V1", start: 0, stop: 5, step: 0.1 }).toSource({ format: "pretty" }))
    .toBe(".dc V1 0 5 0.1")
})
