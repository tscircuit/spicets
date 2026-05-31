import { expect, test } from "bun:test"
import { Include, Lib, Measure, Model, Options, Param, Save, Temp } from "lib"

test("serializes model, param, include, lib, options, temp, save, and measure", () => {
  expect(new Param({ rload: "10k" }).toSource({ format: "pretty" })).toBe(
    ".param rload=10k",
  )
  expect(
    new Model({
      name: "DFAST",
      type: "D",
      params: { IS: "1n", RS: 1 },
    }).toSource({ format: "pretty" }),
  ).toBe(".model DFAST D (IS=1n RS=1)")
  expect(new Include("vendor.lib").toSource({ format: "pretty" })).toBe(
    ".include vendor.lib",
  )
  expect(
    new Lib({ path: "vendor.lib", section: "tt" }).toSource({
      format: "pretty",
    }),
  ).toBe(".lib vendor.lib tt")
  expect(new Options({ reltol: "1e-3" }).toSource({ format: "pretty" })).toBe(
    ".options reltol=1e-3",
  )
  expect(new Temp([25, 85]).toSource({ format: "pretty" })).toBe(".temp 25 85")
  expect(new Save(["v(out)", "i(V1)"]).toSource({ format: "pretty" })).toBe(
    ".save v(out) i(V1)",
  )
  expect(
    new Measure({
      analysis: "tran",
      name: "t_rise",
      expression: "TRIG v(out) VAL=1 RISE=1",
    }).toSource({ format: "pretty" }),
  ).toBe(".measure tran t_rise TRIG v(out) VAL=1 RISE=1")
})
