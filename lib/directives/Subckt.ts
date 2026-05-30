import { DotCommand, type SpiceNode, type SpiceNodeInit, type SpiceSerializeOptions } from "../ast"
import type { SpiceCardInput } from "../roots"
import type { SpiceLogicalCard } from "../tokens"
import { cardOriginalSource, directiveArgs, parseParamTokenStrings } from "../tokens/fromTokens"
import {
  ParamList,
  type NodeRefInput,
  type ParamsInput,
  normalizeNodeRef,
} from "../values"

export class Subckt extends DotCommand {
  static spiceTokenKeys = [".subckt"]
  readonly type = "subckt" as const
  command = ".subckt"
  name: string
  pins
  params: ParamList
  cards: SpiceCardInput[]
  endsName?: string

  constructor(init: SpiceNodeInit & {
    name: string
    pins?: NodeRefInput[]
    params?: ParamsInput
    cards?: SpiceCardInput[]
    endsName?: string
  }) {
    super(init)
    this.name = init.name
    this.pins = (init.pins ?? []).map(normalizeNodeRef)
    this.params = new ParamList(init.params)
    this.cards = init.cards ?? []
    this.endsName = init.endsName
  }

  static fromSpiceTokens(card: SpiceLogicalCard): Subckt {
    const args = directiveArgs(card)
    const paramsIndex = args.findIndex((arg) => arg.toLowerCase() === "params:")
    const pinsEnd = paramsIndex === -1 ? args.length : paramsIndex
    return new Subckt({
      name: args[0] ?? "",
      pins: args.slice(1, pinsEnd),
      params:
        paramsIndex === -1
          ? undefined
          : parseParamTokenStrings(args.slice(paramsIndex + 1)),
      originalSource: cardOriginalSource(card),
    })
  }

  add(card: SpiceCardInput): void {
    this.cards.push(card)
  }

  getChildren(): SpiceNode[] {
    return this.cards
  }

  toSource(options?: SpiceSerializeOptions): string {
    if (options?.format !== "pretty" && this.originalSource !== undefined) return this.originalSource
    const params = this.params.getString(options)
    return [
      [
        this.command,
        this.name,
        ...this.pins.map((pin) => pin.getString()),
        params ? "params:" : undefined,
        params || undefined,
      ]
        .filter((part): part is string => part !== undefined)
        .join(" "),
      ...this.cards.map((card) => card.toSource(options)),
      [".ends", this.endsName ?? this.name].join(" "),
    ].join("\n")
  }
}
DotCommand.register(Subckt)
