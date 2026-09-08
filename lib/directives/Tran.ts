import {
  AnalysisCommand,
  assertPspiceTarget,
  type SpiceNodeInit,
  type SpiceSerializeOptions,
} from "../ast"
import type { SpiceLogicalCard } from "../tokens"
import { SpiceTokenCard } from "../tokens/fromTokens"
import { SpiceValue, type SpiceValueInput, normalizeValue } from "../values"

export class Tran extends AnalysisCommand {
  static spiceTokenKeys = [".tran"]
  readonly type = "tran" as const
  command = ".tran"
  step?: SpiceValue
  stop: SpiceValue
  start?: SpiceValue
  maxStep?: SpiceValue
  uic?: boolean
  pspiceOp: boolean

  constructor(
    init: SpiceNodeInit & {
      step?: SpiceValueInput
      stop: SpiceValueInput
      start?: SpiceValueInput
      maxStep?: SpiceValueInput
      uic?: boolean
      pspiceOp?: boolean
    },
  ) {
    super(init)
    this.step = init.step === undefined ? undefined : normalizeValue(init.step)
    this.stop = normalizeValue(init.stop)
    this.start =
      init.start === undefined ? undefined : normalizeValue(init.start)
    this.maxStep =
      init.maxStep === undefined ? undefined : normalizeValue(init.maxStep)
    this.uic = init.uic
    this.pspiceOp = init.pspiceOp ?? false
  }

  static fromSpiceTokens(card: SpiceLogicalCard): Tran {
    const tokens = SpiceTokenCard.from(card)
    const args = tokens.tokens
      .slice(1)
      .flatMap((token, index) =>
        token.type === "comment" ? [] : [tokens.arg(index) ?? token.raw],
      )
    const uicIndex = args.findIndex((arg) => arg.toLowerCase() === "uic")
    const timing = uicIndex === -1 ? args : args.slice(0, uicIndex)
    return new Tran({
      step: timing[0],
      stop: timing[1] ?? "",
      start: timing[2],
      maxStep: timing[3],
      uic: uicIndex !== -1,
      pspiceOp: tokens.originalSource
        .trimStart()
        .toLowerCase()
        .startsWith(".tran/op"),
      originalSource: tokens.originalSource,
    })
  }

  getChildren(): [] {
    return []
  }

  toSource(options?: SpiceSerializeOptions): string {
    if (this.pspiceOp) assertPspiceTarget(options, ".TRAN/OP")
    if (options?.format !== "pretty" && this.originalSource !== undefined)
      return this.originalSource
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
AnalysisCommand.register(Tran)
