import { AnalysisCommand, type SpiceNodeInit, type SpiceSerializeOptions } from "../ast"
import type { SpiceLogicalCard } from "../tokens"
import { SpiceTokenCard } from "../tokens/fromTokens"
import { SpiceValue, type SpiceValueInput, normalizeValue } from "../values"

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
  static spiceTokenKeys = [".dc"]
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

  static fromSpiceTokens(card: SpiceLogicalCard): Dc {
    const tokens = SpiceTokenCard.from(card)
    return new Dc({
      source: tokens.arg(0) ?? "",
      start: tokens.arg(1) ?? "",
      stop: tokens.arg(2) ?? "",
      step: tokens.arg(3) ?? "",
      originalSource: tokens.originalSource,
    })
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
AnalysisCommand.register(Dc)
