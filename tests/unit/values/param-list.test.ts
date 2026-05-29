import { expect, test } from "bun:test"
import { ParamList } from "lib"

test("supports ParamList object, tuple, get, set, delete, and stable output", () => {
  const params = new ParamList({ rtop: "10k" })
  const setResult = params.set("rbot", "20k")

  expect(setResult).toBeUndefined()
  expect(params.get("RTOP")?.getString()).toBe("10k")
  expect(params.getString()).toBe("rtop=10k rbot=20k")
  expect(params.delete("rtop")).toBe(true)
  expect(params.getString()).toBe("rbot=20k")
  expect(new ParamList([["temp", 25]]).getString()).toBe("temp=25")
})
