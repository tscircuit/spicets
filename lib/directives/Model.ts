import { DotCommand, type SpiceNodeInit, type SpiceSerializeOptions } from "../ast"
import type { SpiceLogicalCard } from "../tokens"
import { SpiceTokenCard } from "../tokens/fromTokens"
import { ParamList, type ParamsInput } from "../values"

export class Model extends DotCommand {
  static spiceTokenKeys = [".model"]
  readonly type = "model" as const
  command = ".model"
  name: string
  modelType: string
  params: ParamList

  constructor(init: SpiceNodeInit & { name: string; type: string; params?: ParamsInput }) {
    super(init)
    this.name = init.name
    this.modelType = init.type
    this.params = new ParamList(init.params)
  }

  static fromSpiceTokens(card: SpiceLogicalCard): Model {
    const tokens = SpiceTokenCard.from(card)
    return new Model({
      name: tokens.arg(0) ?? "",
      type: tokens.arg(1) ?? "",
      params: tokens.paramsAfter(2),
      originalSource: tokens.originalSource,
    })
  }

  getChildren(): [] {
    return []
  }

  toSource(options?: SpiceSerializeOptions): string {
    if (options?.format !== "pretty" && this.originalSource !== undefined) return this.originalSource
    const params = this.params.getString(options)
    return [this.command, this.name, this.modelType, params && `(${params})`]
      .filter(Boolean)
      .join(" ")
  }
}
DotCommand.register(Model)
