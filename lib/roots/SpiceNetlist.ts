import {
  AnalysisCommand,
  DotCommand,
  SpiceNode,
  type SpiceDialect,
  type SpiceSerializeOptions,
} from "../ast"
import { End, Model, Subckt } from "../directives"
import { ElementCard } from "../elements"
import type { SpiceCardInput } from "./types"

export interface SpiceNetlistInit {
  title?: string
  cards?: SpiceCardInput[]
  end?: boolean | End
  dialect?: SpiceDialect
  trailingNewline?: boolean
  lineEnding?: "\n" | "\r\n" | "\r"
}

export class SpiceNetlist extends SpiceNode {
  readonly type = "netlist" as const
  title?: string
  cards: SpiceCardInput[]
  end?: End
  dialect: SpiceDialect
  trailingNewline: boolean
  lineEnding: "\n" | "\r\n" | "\r"

  constructor(init: SpiceNetlistInit = {}) {
    super()
    this.title = init.title
    this.cards = init.cards ?? []
    this.end =
      init.end instanceof End
        ? init.end
        : init.end === false
          ? undefined
          : new End()
    this.dialect = init.dialect ?? "generic"
    this.trailingNewline = init.trailingNewline ?? true
    this.lineEnding = init.lineEnding ?? "\n"
  }

  get elements(): ElementCard[] {
    return this.cards.filter(
      (card): card is ElementCard => card.cardKind === "element",
    )
  }

  get directives(): DotCommand[] {
    return this.cards.filter(
      (card): card is DotCommand => card.cardKind === "directive",
    )
  }

  get subckts(): Subckt[] {
    return this.cards.filter((card): card is Subckt => card instanceof Subckt)
  }

  get models(): Model[] {
    return this.cards.filter((card): card is Model => card instanceof Model)
  }

  get analyses(): AnalysisCommand[] {
    return this.cards.filter(
      (card): card is AnalysisCommand => card instanceof AnalysisCommand,
    )
  }

  add(card: SpiceCardInput): void {
    this.cards.push(card)
  }

  addAll(cards: SpiceCardInput[]): void {
    this.cards.push(...cards)
  }

  findElement(name: string): ElementCard | undefined {
    return this.elements.find(
      (element) => element.name.toLowerCase() === name.toLowerCase(),
    )
  }

  findModel(name: string): Model | undefined {
    return this.models.find(
      (model) => model.name.toLowerCase() === name.toLowerCase(),
    )
  }

  findSubckt(name: string): Subckt | undefined {
    return this.subckts.find(
      (subckt) => subckt.name.toLowerCase() === name.toLowerCase(),
    )
  }

  renameNode(from: string, to: string): void {
    for (const element of this.elements) element.renameNode(from, to)
    for (const subckt of this.subckts) {
      for (const card of subckt.cards) {
        if (card instanceof ElementCard) card.renameNode(from, to)
      }
    }
  }

  getChildren(): SpiceNode[] {
    return [...this.cards, ...(this.end === undefined ? [] : [this.end])]
  }

  override getString(options: SpiceSerializeOptions = {}): string {
    return this.toSource(options)
  }

  toSource(options: SpiceSerializeOptions = {}): string {
    const endMode = options.end ?? "auto"
    const lines = [
      this.title,
      ...this.cards.map((card) => card.toSource(options)),
      endMode === "never"
        ? undefined
        : endMode === "always"
          ? (this.end ?? new End()).toSource(options)
          : this.end?.toSource(options),
    ].filter((line): line is string => line !== undefined)
    const source = lines.join(this.lineEnding)
    return this.trailingNewline ? `${source}${this.lineEnding}` : source
  }
}
