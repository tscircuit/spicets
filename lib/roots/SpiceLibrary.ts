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

  constructor(init: SpiceLibraryInit = {}) {
    super()
    this.sections = init.sections ?? []
    this.cards = init.cards ?? []
    this.dialect = init.dialect ?? "generic"
    this.trailingNewline = init.trailingNewline ?? true
    this.lineEnding = init.lineEnding ?? "\n"
  }

  getChildren(): SpiceNode[] {
    return [...this.cards, ...this.sections]
  }

  override getString(options?: SpiceSerializeOptions): string {
    return this.toSource(options)
  }

  toSource(options?: SpiceSerializeOptions): string {
    const source = [
      ...this.cards.map((card) => card.toSource(options)),
      ...this.sections.map((section) => section.toSource(options)),
    ].join(this.lineEnding)
    return this.trailingNewline ? `${source}${this.lineEnding}` : source
  }
}
