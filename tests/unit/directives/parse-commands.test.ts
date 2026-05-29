import { expect, test } from "bun:test"
import { Include, Lib, Model, Options, Param, Save, Temp, parseSpiceCard } from "lib"

test("parses model, param, include, lib, options, temp, and save commands", () => {
  expect(parseSpiceCard(".param rload=10k")).toBeInstanceOf(Param)
  expect(parseSpiceCard(".model DFAST D(IS=1n RS=1)")).toBeInstanceOf(Model)
  expect(parseSpiceCard(".include vendor.lib")).toBeInstanceOf(Include)
  expect(parseSpiceCard(".lib vendor.lib tt")).toBeInstanceOf(Lib)
  expect(parseSpiceCard(".options reltol=1e-3")).toBeInstanceOf(Options)
  expect(parseSpiceCard(".temp 25 85")).toBeInstanceOf(Temp)
  expect(parseSpiceCard(".save v(out) i(V1)")).toBeInstanceOf(Save)
})
