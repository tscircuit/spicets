import type { SpiceSerializeOptions } from "../ast"
import { IndependentSource } from "./IndependentSource"

export class VoltageSource extends IndependentSource {
  readonly type = "voltage_source" as const

  toSource(options?: SpiceSerializeOptions): string {
    return this.formatParts(this.sourceParts(), options)
  }
}
