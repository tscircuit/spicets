import { AnalysisCommand, DotCommand, type SpiceNode, type SpiceNodeInit, type SpiceSerializeOptions } from "./ast"
import type { SpiceCardInput } from "./roots"
import {
  ParamList,
  SpiceValue,
  type NodeRefInput,
  type ParamsInput,
  type SpiceValueInput,
  normalizeNodeRef,
  normalizeValue,
} from "./values"

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

export class Model extends DotCommand {
  readonly type = "model" as const
  command = ".model"
  name: string
  modelType: string
  params: ParamList

  constructor(init: SpiceNodeInit & { name: string; type: string; params?: ParamsInput }) {
    super(init)
    this.name = init.name
    this.modelType = init.type
    this.params = new ParamList(init.params)
  }

  getChildren(): [] {
    return []
  }

  toSource(options?: SpiceSerializeOptions): string {
    if (options?.format !== "pretty" && this.originalSource !== undefined) return this.originalSource
    const params = this.params.getString(options)
    return [this.command, this.name, this.modelType, params && `(${params})`]
      .filter(Boolean)
      .join(" ")
  }
}

export class Include extends DotCommand {
  readonly type = "include" as const
  command = ".include"
  path: string

  constructor(path: string | { path: string }, init: SpiceNodeInit = {}) {
    super(init)
    this.path = typeof path === "string" ? path : path.path
  }

  getChildren(): [] {
    return []
  }

  toSource(options?: SpiceSerializeOptions): string {
    if (options?.format !== "pretty" && this.originalSource !== undefined) return this.originalSource
    return `${this.command} ${this.path}`
  }
}

export class Lib extends DotCommand {
  readonly type = "lib" as const
  command = ".lib"
  path?: string
  section?: string

  constructor(init: SpiceNodeInit & { path?: string; section?: string } = {}) {
    super(init)
    this.path = init.path
    this.section = init.section
  }

  getChildren(): [] {
    return []
  }

  toSource(options?: SpiceSerializeOptions): string {
    if (options?.format !== "pretty" && this.originalSource !== undefined) return this.originalSource
    return [this.command, this.path, this.section].filter(Boolean).join(" ")
  }
}

export class Options extends DotCommand {
  readonly type = "options" as const
  command = ".options"
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

export class Temp extends DotCommand {
  readonly type = "temp" as const
  command = ".temp"
  values: SpiceValue[]

  constructor(values: SpiceValueInput[], init: SpiceNodeInit = {}) {
    super(init)
    this.values = values.map(normalizeValue)
  }

  getChildren(): [] {
    return []
  }

  toSource(options?: SpiceSerializeOptions): string {
    if (options?.format !== "pretty" && this.originalSource !== undefined) return this.originalSource
    return [this.command, ...this.values.map((value) => value.getString())].join(" ")
  }
}

export class End extends DotCommand {
  readonly type = "end" as const
  command = ".end"

  getChildren(): [] {
    return []
  }

  toSource(options?: SpiceSerializeOptions): string {
    if (options?.format !== "pretty" && this.originalSource !== undefined) return this.originalSource
    return this.command
  }
}

export class Subckt extends DotCommand {
  readonly type = "subckt" as const
  command = ".subckt"
  name: string
  pins
  params: ParamList
  cards: SpiceCardInput[]
  endsName?: string

  constructor(init: SpiceNodeInit & {
    name: string
    pins?: NodeRefInput[]
    params?: ParamsInput
    cards?: SpiceCardInput[]
    endsName?: string
  }) {
    super(init)
    this.name = init.name
    this.pins = (init.pins ?? []).map(normalizeNodeRef)
    this.params = new ParamList(init.params)
    this.cards = init.cards ?? []
    this.endsName = init.endsName
  }

  add(card: SpiceCardInput): this {
    this.cards.push(card)
    return this
  }

  getChildren(): SpiceNode[] {
    return this.cards
  }

  toSource(options?: SpiceSerializeOptions): string {
    if (options?.format !== "pretty" && this.originalSource !== undefined) return this.originalSource
    const params = this.params.getString(options)
    return [
      [
        this.command,
        this.name,
        ...this.pins.map((pin) => pin.getString()),
        params ? "params:" : undefined,
        params || undefined,
      ]
        .filter((part): part is string => part !== undefined)
        .join(" "),
      ...this.cards.map((card) => card.toSource(options)),
      [".ends", this.endsName ?? this.name].join(" "),
    ].join("\n")
  }
}

export class Op extends AnalysisCommand {
  readonly type = "op" as const
  command = ".op"

  getChildren(): [] {
    return []
  }

  toSource(options?: SpiceSerializeOptions): string {
    if (options?.format !== "pretty" && this.originalSource !== undefined) return this.originalSource
    return this.command
  }
}

export class Tran extends AnalysisCommand {
  readonly type = "tran" as const
  command = ".tran"
  step?: SpiceValue
  stop: SpiceValue
  start?: SpiceValue
  maxStep?: SpiceValue
  uic?: boolean

  constructor(init: SpiceNodeInit & {
    step?: SpiceValueInput
    stop: SpiceValueInput
    start?: SpiceValueInput
    maxStep?: SpiceValueInput
    uic?: boolean
  }) {
    super(init)
    this.step = init.step === undefined ? undefined : normalizeValue(init.step)
    this.stop = normalizeValue(init.stop)
    this.start = init.start === undefined ? undefined : normalizeValue(init.start)
    this.maxStep =
      init.maxStep === undefined ? undefined : normalizeValue(init.maxStep)
    this.uic = init.uic
  }

  getChildren(): [] {
    return []
  }

  toSource(options?: SpiceSerializeOptions): string {
    if (options?.format !== "pretty" && this.originalSource !== undefined) return this.originalSource
    return [
      this.command,
      this.step?.getString(),
      this.stop.getString(),
      this.start?.getString(),
      this.maxStep?.getString(),
      this.uic ? "UIC" : undefined,
    ]
      .filter(Boolean)
      .join(" ")
  }
}

export class Ac extends AnalysisCommand {
  readonly type = "ac" as const
  command = ".ac"
  sweep: "dec" | "oct" | "lin"
  points: number
  start: SpiceValue
  stop: SpiceValue

  constructor(init: SpiceNodeInit & {
    sweep: "dec" | "oct" | "lin"
    points: number
    start: SpiceValueInput
    stop: SpiceValueInput
  }) {
    super(init)
    this.sweep = init.sweep
    this.points = init.points
    this.start = normalizeValue(init.start)
    this.stop = normalizeValue(init.stop)
  }

  getChildren(): [] {
    return []
  }

  toSource(options?: SpiceSerializeOptions): string {
    if (options?.format !== "pretty" && this.originalSource !== undefined) return this.originalSource
    return `${this.command} ${this.sweep} ${this.points} ${this.start.getString()} ${this.stop.getString()}`
  }
}

export interface DcSweep {
  source: string
  start: SpiceValue
  stop: SpiceValue
  step: SpiceValue
}

export type DcSweepInput = {
  source: string
  start: SpiceValueInput
  stop: SpiceValueInput
  step: SpiceValueInput
}

export class Dc extends AnalysisCommand {
  readonly type = "dc" as const
  command = ".dc"
  sweeps: DcSweep[]

  constructor(init: SpiceNodeInit & (DcSweepInput | { sweeps: DcSweepInput[] })) {
    super(init)
    const sweeps = "sweeps" in init ? init.sweeps : [init]
    this.sweeps = sweeps.map((sweep) => ({
      source: sweep.source,
      start: normalizeValue(sweep.start),
      stop: normalizeValue(sweep.stop),
      step: normalizeValue(sweep.step),
    }))
  }

  getChildren(): [] {
    return []
  }

  toSource(options?: SpiceSerializeOptions): string {
    if (options?.format !== "pretty" && this.originalSource !== undefined) return this.originalSource
    return [
      this.command,
      ...this.sweeps.flatMap((sweep) => [
        sweep.source,
        sweep.start.getString(),
        sweep.stop.getString(),
        sweep.step.getString(),
      ]),
    ].join(" ")
  }
}

export class Save extends DotCommand {
  readonly type = "save" as const
  command = ".save"
  expressions: string[]

  constructor(expressions: string[], init: SpiceNodeInit = {}) {
    super(init)
    this.expressions = expressions
  }

  getChildren(): [] {
    return []
  }

  toSource(options?: SpiceSerializeOptions): string {
    if (options?.format !== "pretty" && this.originalSource !== undefined) return this.originalSource
    return [this.command, ...this.expressions].join(" ")
  }
}

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

export class ControlBlock extends DotCommand {
  readonly type = "control" as const
  command = ".control"
  lines: string[]

  constructor(init: SpiceNodeInit & { lines: string[] }) {
    super(init)
    this.lines = init.lines
  }

  getChildren(): [] {
    return []
  }

  toSource(options?: SpiceSerializeOptions): string {
    if (options?.format !== "pretty" && this.originalSource !== undefined) return this.originalSource
    return [this.command, ...this.lines, ".endc"].join("\n")
  }
}

export class UnknownDotCommand extends DotCommand {
  readonly type = "unknown_dot_command" as const
  command: string
  args: string[]

  constructor(init: SpiceNodeInit & { command: string; args: string[] }) {
    super(init)
    this.command = init.command
    this.args = init.args
  }

  getChildren(): [] {
    return []
  }

  toSource(options?: SpiceSerializeOptions): string {
    if (options?.format !== "pretty" && this.originalSource !== undefined) return this.originalSource
    return [this.command, ...this.args].join(" ")
  }
}
