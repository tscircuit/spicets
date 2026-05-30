import type { SpiceNodeInit, SpiceSerializeOptions } from "../ast"
import type { NodeRefInput } from "../values"
import { ElementCard } from "./ElementCard"

export class UnknownElementCard extends ElementCard {
  readonly type = "unknown_element" as const
  designator: string
  tokens: string[]

  constructor(init: SpiceNodeInit & {
    name: string
    designator: string
    nodes?: NodeRefInput[]
    tokens: string[]
  }) {
    super(init)
    this.designator = init.designator
    this.tokens = init.tokens
  }

  toSource(options?: SpiceSerializeOptions): string {
    return this.formatParts([this.name, ...this.tokens], options)
  }
}
