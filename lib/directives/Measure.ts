import { DotCommand, type SpiceNodeInit, type SpiceSerializeOptions } from "../ast"

export class Measure extends DotCommand {
  readonly type = "measure" as const
  command = ".measure"
  analysis?: string
  name: string
  expression: string

  constructor(init: SpiceNodeInit & {
    analysis?: string
    name: string
    expression: string
  }) {
    super(init)
    this.analysis = init.analysis
    this.name = init.name
    this.expression = init.expression
  }

  getChildren(): [] {
    return []
  }

  toSource(options?: SpiceSerializeOptions): string {
    if (options?.format !== "pretty" && this.originalSource !== undefined) return this.originalSource
    return [this.command, this.analysis, this.name, this.expression]
      .filter(Boolean)
      .join(" ")
  }
}
