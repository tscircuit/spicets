import {
  DotCommand,
  type SpiceNodeInit,
  type SpiceSerializeOptions,
} from "../ast"
import type { SpiceLogicalCard } from "../tokens"
import { SpiceTokenCard } from "../tokens/fromTokens"
import { ParamList, type ParamsInput } from "../values"

type OptionItem = { name: string; value?: string }

export class Options extends DotCommand {
  static spiceTokenKeys = [".options"]
  readonly type = "options" as const
  command = ".options"
  values: ParamList
  flags: string[]
  items: OptionItem[]

  constructor(
    values: ParamsInput,
    init: SpiceNodeInit & { flags?: string[]; items?: OptionItem[] } = {},
  ) {
    super(init)
    this.values = new ParamList(values)
    this.flags = init.flags ?? []
    this.items = init.items ?? [
      ...this.flags.map((name) => ({ name })),
      ...this.values.entries().map(([name, value]) => ({
        name,
        value: value.getString(),
      })),
    ]
  }

  static fromSpiceTokens(card: SpiceLogicalCard): Options {
    const tokens = SpiceTokenCard.from(card)
    const items = tokens.optionItems()
    const assignments = items.filter(
      (item): item is { name: string; value: string } =>
        item.value !== undefined,
    )
    const params: Array<[string, string]> = assignments.map((item) => [
      item.name,
      item.value,
    ])
    return new Options(params, {
      originalSource: tokens.originalSource,
      flags: items
        .filter((item) => item.value === undefined)
        .map((item) => item.name),
      items,
    })
  }

  getChildren(): [] {
    return []
  }

  toSource(options?: SpiceSerializeOptions): string {
    if (options?.format !== "pretty" && this.originalSource !== undefined)
      return this.originalSource
    const body = this.items
      .map((item) =>
        item.value === undefined ? item.name : `${item.name}=${item.value}`,
      )
      .join(" ")
    return `${this.command} ${body}`.trimEnd()
  }
}
DotCommand.register(Options)
