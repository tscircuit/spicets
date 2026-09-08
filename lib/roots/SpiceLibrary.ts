import {
  SpiceNode,
  type SpiceDialect,
  type SpiceSerializeOptions,
} from "../ast"
import { LibSection } from "./LibSection"
import type { SpiceCardInput } from "./types"

export interface SpiceLibraryInit {
  cards?: SpiceCardInput[]
  sections?: LibSection[]
  sourceOrder?: Array<"card" | "section">
  dialect?: SpiceDialect
  trailingNewline?: boolean
  lineEnding?: "\n" | "\r\n" | "\r"
}

export class SpiceLibrary extends SpiceNode {
  readonly type = "library" as const
  sections: LibSection[]
  cards: SpiceCardInput[]
  dialect: SpiceDialect
  trailingNewline: boolean
  lineEnding: "\n" | "\r\n" | "\r"
  private sourceOrder?: Array<"card" | "section">

  constructor(init: SpiceLibraryInit = {}) {
    super()
    this.sections = init.sections ?? []
    this.cards = init.cards ?? []
    this.dialect = init.dialect ?? "generic"
    this.trailingNewline = init.trailingNewline ?? true
    this.lineEnding = init.lineEnding ?? "\n"
    this.sourceOrder = init.sourceOrder
  }

  getChildren(): SpiceNode[] {
    const result: SpiceNode[] = []
    let cardIndex = 0
    let sectionIndex = 0
    for (const kind of this.sourceOrder ?? []) {
      const entry =
        kind === "card"
          ? this.cards[cardIndex++]
          : this.sections[sectionIndex++]
      if (entry !== undefined) result.push(entry)
    }
    return [
      ...result,
      ...this.cards.slice(cardIndex),
      ...this.sections.slice(sectionIndex),
    ]
  }

  override getString(options?: SpiceSerializeOptions): string {
    return this.toSource(options)
  }

  toSource(options?: SpiceSerializeOptions): string {
    const source = this.getChildren()
      .map((entry) => entry.toSource(options))
      .join(this.lineEnding)
    return this.trailingNewline ? `${source}${this.lineEnding}` : source
  }
}
