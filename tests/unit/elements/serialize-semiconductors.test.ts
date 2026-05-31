import { expect, test } from "bun:test"
import { Bjt, Diode, Mosfet } from "lib"

test("serializes semiconductor cards", () => {
  expect(
    new Diode({ name: "D1", nodes: ["an", "cath"], model: "DFAST" }).toSource({
      format: "pretty",
    }),
  ).toBe("D1 an cath DFAST")
  expect(
    new Bjt({ name: "Q1", nodes: ["c", "b", "e"], model: "QNPN" }).toSource({
      format: "pretty",
    }),
  ).toBe("Q1 c b e QNPN")
  expect(
    new Mosfet({
      name: "M1",
      nodes: ["d", "g", "s", "b"],
      model: "NMOS",
      params: { L: "1u", W: "2u" },
    }).toSource({ format: "pretty" }),
  ).toBe("M1 d g s b NMOS L=1u W=2u")
})
