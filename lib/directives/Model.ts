import { DotCommand, type SpiceNodeInit, type SpiceSerializeOptions } from "../ast"
import { ParamList, type ParamsInput } from "../values"

export class Model extends DotCommand {
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
