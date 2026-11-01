import { expect, test } from "bun:test"
import { LibSection, Resistor, SpiceLibrary, parseSpiceNetlist } from "lib"

test("pretty format preserves CRLF across subckt, control block, and lib section", () => {
  const subcktSource =
    ".subckt divider vin vout 0\r\nR1 vin vout 10k\r\nR2 vout 0 10k\r\n.ends divider\r\nV1 vin 0 DC 5\r\n.end\r\n"
  const subcktNetlist = parseSpiceNetlist(subcktSource)
  expect(subcktNetlist.getString({ format: "pretty" })).toBe(
    ".subckt divider vin vout 0\r\nR1 vin vout 10k\r\nR2 vout 0 10k\r\n.ends divider\r\nV1 vin 0 DC 5\r\n.end\r\n",
  )

  const controlSource =
    ".control\r\ntran 1n 10n\r\nplot v(out)\r\n.endc\r\nV1 in 0 DC 5\r\n.end\r\n"
  const controlNetlist = parseSpiceNetlist(controlSource)
  expect(controlNetlist.getString({ format: "pretty" })).toBe(
    ".control\r\ntran 1n 10n\r\nplot v(out)\r\n.endc\r\nV1 in 0 DC 5\r\n.end\r\n",
  )

  const library = new SpiceLibrary({
    lineEnding: "\r\n",
    trailingNewline: true,
    sections: [
      new LibSection({
        name: "nominal",
        cards: [
          new Resistor({
            name: "R1",
            nodes: ["n1", "n2"],
            resistance: "1k",
          }),
        ],
      }),
    ],
  })
  expect(library.getString({ format: "pretty" })).toBe(
    ".lib nominal\r\nR1 n1 n2 1k\r\n.endl\r\n",
  )
})
