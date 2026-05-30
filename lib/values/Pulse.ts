import { SourceWaveform } from "./SourceWaveform"
import { normalizeValue } from "./normalize"
import { SpiceValue } from "./SpiceValue"
import type { SpiceValueInput } from "./types"

export class Pulse extends SourceWaveform {
  readonly type = "pulse" as const
  values: SpiceValue[]

  constructor(init: {
    initial: SpiceValueInput
    pulsed: SpiceValueInput
    delay?: SpiceValueInput
    rise?: SpiceValueInput
    fall?: SpiceValueInput
    width?: SpiceValueInput
    period?: SpiceValueInput
  }) {
    super()
    this.values = [
      init.initial,
      init.pulsed,
      init.delay,
      init.rise,
      init.fall,
      init.width,
      init.period,
    ]
      .filter((value): value is SpiceValueInput => value !== undefined)
      .map(normalizeValue)
  }

  toSource(): string {
    return `PULSE(${this.values.map((value) => value.getString()).join(" ")})`
  }
}
