import {
  DotCommand,
  SpiceCard,
  type SpiceNode,
  type SpiceNodeInit,
  type SpiceSerializeOptions,
} from "../ast"
import type { SpiceCardInput } from "../roots"
import type { SpiceLogicalCard } from "../tokens"
import { SpiceTokenCard } from "../tokens/fromTokens"
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

  constructor(
    init: SpiceNodeInit & {
      name: string
      pins?: NodeRefInput[]
      params?: ParamsInput
      cards?: SpiceCardInput[]
      endsName?: string
    },
  ) {
    super(init)
    this.name = init.name
    this.pins = (init.pins ?? []).map(normalizeNodeRef)
    this.params = new ParamList(init.params)
    this.cards = init.cards ?? []
    this.endsName = init.endsName
  }

  static fromSpiceTokens(card: SpiceLogicalCard): Subckt {
    const tokens = SpiceTokenCard.from(card)
    const endTokens =
      card.endCard === undefined ? undefined : SpiceTokenCard.from(card.endCard)
    return new Subckt({
      name: tokens.arg(0) ?? "",
      pins: tokens.argsBeforeKeyword("params:", 1),
      params: tokens.paramsAfterKeyword("params:"),
      cards: card.childCards?.map(
        (childCard) => SpiceCard.parseSpiceTokens(childCard) as SpiceCardInput,
      ),
      endsName: endTokens?.arg(0),
      originalSource: tokens.originalSource,
    })
  }

  add(card: SpiceCardInput): void {
    this.cards.push(card)
  }

  getChildren(): SpiceNode[] {
    return this.cards
  }

  toSource(options?: SpiceSerializeOptions): string {
    if (options?.format !== "pretty" && this.originalSource !== undefined)
      return this.originalSource
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
