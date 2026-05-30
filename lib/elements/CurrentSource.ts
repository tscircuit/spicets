import type { SpiceSerializeOptions } from "../ast"
import { IndependentSource } from "./IndependentSource"

export class CurrentSource extends IndependentSource {
  readonly type = "current_source" as const

  toSource(options?: SpiceSerializeOptions): string {
    return this.formatParts(this.sourceParts(), options)
  }
}
