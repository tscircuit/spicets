import { SpiceNode, type SpiceSerializeOptions } from "./ast"

export type NodeRefInput = string | NodeRef
export type SpiceValueInput = string | number | SpiceValue | SpiceExpression

export class NodeRef {
  name: string

  constructor(name: string) {
    this.name = name
  }

  static ground(): NodeRef {
    return new NodeRef("0")
  }

  getString(): string {
    return this.name
  }
}

export class SpiceValue {
  raw: string

  constructor(value: string | number) {
    this.raw = String(value)
  }

  getString(): string {
    return this.raw
  }
}

export class SpiceExpression {
  raw: string

  constructor(raw: string) {
    this.raw = raw
  }

  getString(): string {
    return this.raw
  }
}

export type ParamsInput =
  | Record<string, SpiceValueInput>
  | Array<[string, SpiceValueInput]>
  | ParamList

export class ParamList {
  private values: Array<[string, SpiceValue]>

  constructor(input: ParamsInput = []) {
    if (input instanceof ParamList) {
      this.values = input.entries()
    } else if (Array.isArray(input)) {
      this.values = input.map(([name, value]) => [name, normalizeValue(value)])
    } else {
      this.values = Object.entries(input).map(([name, value]) => [
        name,
        normalizeValue(value),
      ])
    }
  }

  get(name: string): SpiceValue | undefined {
    return this.values.find(([key]) => key.toLowerCase() === name.toLowerCase())?.[1]
  }

  set(name: string, value: SpiceValueInput): this {
    const index = this.values.findIndex(
      ([key]) => key.toLowerCase() === name.toLowerCase(),
    )
    const entry: [string, SpiceValue] = [name, normalizeValue(value)]
    if (index === -1) this.values.push(entry)
    else this.values[index] = entry
    return this
  }

  delete(name: string): boolean {
    const index = this.values.findIndex(
      ([key]) => key.toLowerCase() === name.toLowerCase(),
    )
    if (index === -1) return false
    this.values.splice(index, 1)
    return true
  }

  entries(): Array<[string, SpiceValue]> {
    return this.values.map(([name, value]) => [name, value])
  }

  getString(_options?: SpiceSerializeOptions): string {
    return this.values
      .map(([name, value]) => `${name}=${value.getString()}`)
      .join(" ")
  }

  get isEmpty(): boolean {
    return this.values.length === 0
  }
}

export abstract class SourceWaveform extends SpiceNode {
  getChildren(): SpiceNode[] {
    return []
  }
}

export type SourceWaveformInput = SourceWaveform

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

export interface AcSpec {
  magnitude?: SpiceValue
  phase?: SpiceValue
}

export type AcSpecInput =
  | SpiceValueInput
  | {
      magnitude?: SpiceValueInput
      phase?: SpiceValueInput
    }

export function normalizeNodeRef(input: NodeRefInput): NodeRef {
  return input instanceof NodeRef ? input : new NodeRef(input)
}

export function normalizeValue(input: SpiceValueInput): SpiceValue {
  if (input instanceof SpiceValue) return input
  if (input instanceof SpiceExpression) return new SpiceValue(input.getString())
  return new SpiceValue(input)
}

export function normalizeAcSpec(input: AcSpecInput): AcSpec {
  if (
    typeof input === "object" &&
    !(input instanceof SpiceValue) &&
    !(input instanceof SpiceExpression)
  ) {
    return {
      magnitude:
        input.magnitude === undefined ? undefined : normalizeValue(input.magnitude),
      phase: input.phase === undefined ? undefined : normalizeValue(input.phase),
    }
  }
  return { magnitude: normalizeValue(input) }
}
