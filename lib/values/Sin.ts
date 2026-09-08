import { SourceWaveform } from "./SourceWaveform"
import { normalizeValue } from "./normalize"
import { SpiceValue } from "./SpiceValue"
import type { SpiceValueInput } from "./types"

export class Sin extends SourceWaveform {
  readonly type = "sin" as const
  values: SpiceValue[]

  constructor(init: {
    offset: SpiceValueInput
    amplitude: SpiceValueInput
    frequency: SpiceValueInput
    delay?: SpiceValueInput
    damping?: SpiceValueInput
    phase?: SpiceValueInput
  }) {
    super()
    const values = [
      init.offset,
      init.amplitude,
      init.frequency,
      init.delay,
      init.damping,
      init.phase,
    ]
    this.values = values
      .slice(0, values.findLastIndex((value) => value !== undefined) + 1)
      .map((value) => normalizeValue(value ?? 0))
  }

  toSource(): string {
    return `SIN(${this.values.map((value) => value.getString()).join(" ")})`
  }
}
