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
    this.values = [
      init.offset,
      init.amplitude,
      init.frequency,
      init.delay,
      init.damping,
      init.phase,
    ]
      .filter((value): value is SpiceValueInput => value !== undefined)
      .map(normalizeValue)
  }

  toSource(): string {
    return `SIN(${this.values.map((value) => value.getString()).join(" ")})`
  }
}
