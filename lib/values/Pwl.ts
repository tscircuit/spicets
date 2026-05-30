import { SourceWaveform } from "./SourceWaveform"
import { normalizeValue } from "./normalize"
import { SpiceValue } from "./SpiceValue"
import type { SpiceValueInput } from "./types"

export class Pwl extends SourceWaveform {
  readonly type = "pwl" as const
  points: Array<[SpiceValue, SpiceValue]>

  constructor(points: Array<[SpiceValueInput, SpiceValueInput]>) {
    super()
    this.points = points.map(([time, value]) => [
      normalizeValue(time),
      normalizeValue(value),
    ])
  }

  toSource(): string {
    return `PWL(${this.points
      .flatMap(([time, value]) => [time.getString(), value.getString()])
      .join(" ")})`
  }
}
