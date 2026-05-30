import { SpiceNode, type SpiceSerializeOptions } from "../ast"
import type { SpiceCardInput } from "./types"

export class LibSection extends SpiceNode {
  readonly type = "lib_section" as const
  name: string
  cards: SpiceCardInput[]

  constructor(init: { name: string; cards?: SpiceCardInput[] }) {
    super()
    this.name = init.name
    this.cards = init.cards ?? []
  }

  getChildren(): SpiceNode[] {
    return this.cards
  }

  toSource(options?: SpiceSerializeOptions): string {
    return [
      `.lib ${this.name}`,
      ...this.cards.map((card) => card.toSource(options)),
      ".endl",
    ].join("\n")
  }
}
