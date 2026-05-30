import { DotCommand, type SpiceNodeInit, type SpiceSerializeOptions } from "../ast"
import { ParamList, type ParamsInput } from "../values"

export class Param extends DotCommand {
  readonly type = "param" as const
  command = ".param"
  values: ParamList

  constructor(values: ParamsInput, init: SpiceNodeInit = {}) {
    super(init)
    this.values = new ParamList(values)
  }

  getChildren(): [] {
    return []
  }

  toSource(options?: SpiceSerializeOptions): string {
    if (options?.format !== "pretty" && this.originalSource !== undefined) return this.originalSource
    return `${this.command} ${this.values.getString(options)}`.trimEnd()
  }
}
