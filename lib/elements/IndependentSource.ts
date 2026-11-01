import type { SpiceNodeInit } from "../ast"
import type { SpiceTokenCard } from "../tokens/fromTokens"
import { tokenValue } from "../tokens/logicalCards"
import {
  type AcSpec,
  type AcSpecInput,
  type NodeRefInput,
  normalizeAcSpec,
  normalizeValue,
  type ParamsInput,
  Pulse,
  Pwl,
  Sin,
  type SourceWaveformInput,
  type SpiceValue,
  type SpiceValueInput,
} from "../values"
import { ElementCard } from "./ElementCard"

type ParsedIndependentSourceValues = {
  dc?: SpiceValueInput
  ac?: AcSpecInput
  transient?: SourceWaveformInput
}

const SOURCE_CLAUSE_KEYWORDS = new Set(["dc", "ac", "sin", "pulse", "pwl"])
const WAVEFORM_KEYWORDS = new Set(["sin", "pulse", "pwl"])

export function parseIndependentSourceValues(
  tokens: SpiceTokenCard,
): ParsedIndependentSourceValues {
  const values: ParsedIndependentSourceValues = {}
  const rawTokens = tokens.tokens
  let idx = 3

  while (idx < rawTokens.length) {
    const tok = rawTokens[idx]
    if (!tok || tok.type === "comment") {
      idx += 1
      continue
    }

    const text = tokenValue(tok) ?? tok.raw
    const lower = text.toLowerCase()

    if (lower === "dc") {
      const nextTok = rawTokens[idx + 1]
      const nextText = nextTok
        ? (tokenValue(nextTok) ?? nextTok.raw)
        : undefined
      if (
        nextTok &&
        nextTok.type !== "comment" &&
        nextTok.type !== "punctuation" &&
        nextText !== undefined &&
        !SOURCE_CLAUSE_KEYWORDS.has(nextText.toLowerCase())
      ) {
        values.dc = nextText
        idx += 2
      } else {
        idx += 1
      }
      continue
    }

    if (lower === "ac") {
      const magTok = rawTokens[idx + 1]
      const magText = magTok ? (tokenValue(magTok) ?? magTok.raw) : undefined
      if (
        magTok &&
        magTok.type !== "comment" &&
        magTok.type !== "punctuation" &&
        magText !== undefined &&
        !SOURCE_CLAUSE_KEYWORDS.has(magText.toLowerCase())
      ) {
        const phaseTok = rawTokens[idx + 2]
        const phaseText = phaseTok
          ? (tokenValue(phaseTok) ?? phaseTok.raw)
          : undefined
        if (
          phaseTok &&
          phaseTok.type !== "comment" &&
          phaseTok.type !== "punctuation" &&
          phaseText !== undefined &&
          !SOURCE_CLAUSE_KEYWORDS.has(phaseText.toLowerCase())
        ) {
          values.ac = { magnitude: magText, phase: phaseText }
          idx += 3
        } else {
          values.ac = { magnitude: magText, phase: undefined }
          idx += 2
        }
      } else {
        values.ac = { magnitude: undefined, phase: undefined }
        idx += 1
      }
      continue
    }

    if (WAVEFORM_KEYWORDS.has(lower)) {
      const wfArgs: string[] = []
      idx += 1
      const openParen = rawTokens[idx]
      if (openParen?.type === "punctuation" && openParen.value === "(") {
        idx += 1
        while (idx < rawTokens.length) {
          const inner = rawTokens[idx]!
          idx += 1
          if (inner.type === "punctuation" && inner.value === ")") break
          if (inner.type === "punctuation" && inner.value === ",") continue
          if (inner.type === "comment") continue
          const argVal = tokenValue(inner) ?? inner.raw
          if (argVal !== undefined) wfArgs.push(argVal)
        }
      } else {
        while (idx < rawTokens.length) {
          const inner = rawTokens[idx]!
          if (inner.type === "comment") break
          if (inner.type === "punctuation" && inner.value === ",") {
            idx += 1
            continue
          }
          const nextInner = rawTokens[idx + 1]
          if (nextInner?.type === "operator" && nextInner.value === "=") {
            break
          }
          const argVal = tokenValue(inner) ?? inner.raw
          if (
            argVal !== undefined &&
            SOURCE_CLAUSE_KEYWORDS.has(argVal.toLowerCase())
          ) {
            break
          }
          if (argVal !== undefined) wfArgs.push(argVal)
          idx += 1
        }
      }

      if (lower === "sin") {
        values.transient = new Sin({
          offset: wfArgs[0] ?? 0,
          amplitude: wfArgs[1] ?? 0,
          frequency: wfArgs[2] ?? 0,
          delay: wfArgs[3],
          damping: wfArgs[4],
          phase: wfArgs[5],
        })
      } else if (lower === "pulse") {
        values.transient = new Pulse({
          initial: wfArgs[0] ?? 0,
          pulsed: wfArgs[1] ?? 0,
          delay: wfArgs[2],
          rise: wfArgs[3],
          fall: wfArgs[4],
          width: wfArgs[5],
          period: wfArgs[6],
        })
      } else if (lower === "pwl") {
        const points: Array<[SpiceValueInput, SpiceValueInput]> = []
        for (let p = 0; p + 1 < wfArgs.length; p += 2) {
          points.push([wfArgs[p]!, wfArgs[p + 1]!])
        }
        values.transient = new Pwl(points)
      }
      continue
    }

    const nextAfterIdx = rawTokens[idx + 1]
    if (
      idx === 3 &&
      values.dc === undefined &&
      tok.type !== "punctuation" &&
      !(nextAfterIdx?.type === "operator" && nextAfterIdx.value === "=")
    ) {
      values.dc = text
      idx += 1
      continue
    }

    idx += 1
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
