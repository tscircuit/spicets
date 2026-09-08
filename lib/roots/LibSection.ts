import { SpiceNode, type SpiceSerializeOptions } from "../ast"
import type { SpiceCardInput } from "./types"

export class LibSection extends SpiceNode {
  readonly type = "lib_section" as const
  name: string
  cards: SpiceCardInput[]
  lineEnding: "\n" | "\r\n" | "\r"
  private originalHeader?: string
  private originalEnd?: string

  constructor(init: {
    name: string
    cards?: SpiceCardInput[]
    lineEnding?: "\n" | "\r\n" | "\r"
    originalHeader?: string
    originalEnd?: string
  }) {
    super()
    this.name = init.name
    this.cards = init.cards ?? []
    this.lineEnding = init.lineEnding ?? "\n"
    this.originalHeader = init.originalHeader
    this.originalEnd = init.originalEnd
  }

  getChildren(): SpiceNode[] {
    return this.cards
  }

  toSource(options?: SpiceSerializeOptions): string {
    return [
      options?.format !== "pretty" && this.originalHeader !== undefined
        ? this.originalHeader
        : `.lib ${this.name}`,
      ...this.cards.map((card) => card.toSource(options)),
      options?.format !== "pretty" && this.originalEnd !== undefined
        ? this.originalEnd
        : ".endl",
    ].join(this.lineEnding)
  }
}
