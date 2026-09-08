import type { SpiceNodeInit } from "../ast"
import type { SpiceToken } from "../tokens"
import type { SpiceTokenCard } from "../tokens/fromTokens"
import {
  Pulse,
  Pwl,
  Sin,
  SpiceValue,
  type AcSpec,
  type AcSpecInput,
  type NodeRefInput,
  type ParamsInput,
  type SourceWaveformInput,
  type SpiceValueInput,
  normalizeAcSpec,
  normalizeValue,
} from "../values"
import { ElementCard } from "./ElementCard"

const WAVEFORM_NAMES = new Set(["sin", "pulse", "pwl", "exp", "sffm", "am"])

type ParsedIndependentSourceValues = {
  dc?: SpiceValueInput
  ac?: AcSpecInput
  transient?: SourceWaveformInput
}

function tokenRaw(token: SpiceToken | undefined): string | undefined {
  if (token === undefined) return undefined
  if ("raw" in token && typeof token.raw === "string" && token.raw.length > 0) {
    return token.raw
  }
  return undefined
}

function isWaveformName(value: string | undefined): boolean {
  return value !== undefined && WAVEFORM_NAMES.has(value.toLowerCase())
}

function readParenArgs(
  tokens: SpiceToken[],
  openIndex: number,
): { args: string[]; endIndex: number } {
  const args: string[] = []
  let index = openIndex + 1
  while (index < tokens.length) {
    const token = tokens[index]
    if (token === undefined) break
    if (token.type === "punctuation" && token.value === ")") {
      return { args, endIndex: index }
    }
    if (token.type !== "punctuation") {
      args.push(token.raw)
    }
    index += 1
  }
  return { args, endIndex: index }
}

function waveformFromArgs(
  name: string,
  args: string[],
): SourceWaveformInput | undefined {
  const kind = name.toLowerCase()
  if (kind === "sin" && args.length >= 3) {
    return new Sin({
      offset: args[0]!,
      amplitude: args[1]!,
      frequency: args[2]!,
      delay: args[3],
      damping: args[4],
      phase: args[5],
    })
  }
  if (kind === "pulse" && args.length >= 2) {
    return new Pulse({
      initial: args[0]!,
      pulsed: args[1]!,
      delay: args[2],
      rise: args[3],
      fall: args[4],
      width: args[5],
      period: args[6],
    })
  }
  if (kind === "pwl" && args.length >= 2) {
    const points: Array<[string, string]> = []
    for (let i = 0; i + 1 < args.length; i += 2) {
      points.push([args[i]!, args[i + 1]!])
    }
    return new Pwl(points)
  }
  return undefined
}

export function parseIndependentSourceValues(
  tokens: SpiceTokenCard,
): ParsedIndependentSourceValues {
  const values: ParsedIndependentSourceValues = {}
  const stream = tokens.tokens
  let index = 3
  let sawExplicitDc = false

  while (index < stream.length) {
    const token = stream[index]
    if (token === undefined) break
    if (token.type === "comment" || token.type === "error") {
      index += 1
      continue
    }
    const text = token.type === "punctuation" ? undefined : token.raw
    const lower = text?.toLowerCase()

    if (isWaveformName(text)) {
      const next = stream[index + 1]
      if (next?.type === "punctuation" && next.value === "(") {
        const { args, endIndex } = readParenArgs(stream, index + 1)
        values.transient = waveformFromArgs(text!, args)
        index = endIndex + 1
        continue
      }
    }

    if (lower === "dc") {
      const dcValue = tokenRaw(stream[index + 1])
      if (dcValue !== undefined && !isWaveformName(dcValue)) {
        values.dc = dcValue
        sawExplicitDc = true
        index += 2
        continue
      }
    }

    if (lower === "ac") {
      const magnitude = tokenRaw(stream[index + 1])
      const phaseToken = stream[index + 2]
      const phase =
        phaseToken !== undefined &&
        phaseToken.type !== "punctuation" &&
        !isWaveformName(phaseToken.raw) &&
        phaseToken.raw.toLowerCase() !== "dc"
          ? tokenRaw(phaseToken)
          : undefined
      values.ac = { magnitude, phase }
      index += phase === undefined ? 2 : 3
      continue
    }

    if (
      index === 3 &&
      !sawExplicitDc &&
      values.dc === undefined &&
      values.transient === undefined &&
      token.type !== "punctuation" &&
      !isWaveformName(text) &&
      lower !== "ac"
    ) {
      values.dc = token.raw
      index += 1
      continue
    }

    index += 1
  }

  return values
}

export abstract class IndependentSource extends ElementCard {
  dc?: SpiceValue
  ac?: AcSpec
  transient?: SourceWaveformInput

  constructor(
    init: SpiceNodeInit & {
      name: string
      nodes: [NodeRefInput, NodeRefInput]
      dc?: SpiceValueInput
      ac?: AcSpecInput
      transient?: SourceWaveformInput
      params?: ParamsInput
    },
  ) {
    super(init)
    this.dc = init.dc === undefined ? undefined : normalizeValue(init.dc)
    this.ac = init.ac === undefined ? undefined : normalizeAcSpec(init.ac)
    this.transient = init.transient
  }

  override getChildren() {
    return this.transient === undefined ? [] : [this.transient]
  }

  protected sourceParts(): string[] {
    const parts = [this.name, ...this.nodes.map((node) => node.getString())]
    if (this.dc !== undefined) parts.push("DC", this.dc.getString())
    if (this.ac !== undefined) {
      parts.push("AC")
      if (this.ac.magnitude !== undefined)
        parts.push(this.ac.magnitude.getString())
      if (this.ac.phase !== undefined) parts.push(this.ac.phase.getString())
    }
    if (this.transient !== undefined) parts.push(this.transient.toSource())
    return parts
  }
}
