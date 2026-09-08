import type { SpiceNodeInit } from "../ast"
import type { SpiceTokenCard } from "../tokens/fromTokens"
import {
  SpiceValue,
  Sin,
  Pulse,
  Pwl,
  SourceWaveform,
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
import { splitSourceFields } from "./parse-source-fields"

type ParsedIndependentSourceValues = {
  dc?: SpiceValueInput
  ac?: AcSpecInput
  transient?: SourceWaveformInput
}

class PreservedSourceWaveform extends SourceWaveform {
  readonly type = "preserved_source_waveform" as const
  constructor(private readonly source: string) {
    super()
  }
  toSource(): string {
    return this.source
  }
}

export function parseIndependentSourceValues(
  tokens: SpiceTokenCard,
): ParsedIndependentSourceValues {
  const values: ParsedIndependentSourceValues = {}
  const source = tokens.tokens
    .map(
      (token, index, list) =>
        `${index > 0 && token.range.start.offset > (list[index - 1]?.range.end.offset ?? 0) ? " " : ""}${token.raw}`,
    )
    .join("")
  const fields = splitSourceFields(source).slice(3)
  const isClause = (field: string | undefined) =>
    field !== undefined &&
    /^(?:(?:dc|ac)$|(?:sin|pulse|pwl)(?:\s*\(|$))/i.test(field)
  for (let index = 0; index < fields.length; index++) {
    let field = fields[index]!
    if (/^(sin|pulse|pwl)$/i.test(field) && fields[index + 1]?.startsWith("("))
      field += fields[++index]
    if (field.toLowerCase() === "dc") {
      if (!isClause(fields[index + 1])) values.dc = fields[++index]
    } else if (field.toLowerCase() === "ac") {
      const magnitude = isClause(fields[index + 1])
        ? undefined
        : fields[++index]
      const phase = isClause(fields[index + 1]) ? undefined : fields[index + 1]
      if (phase !== undefined) index++
      values.ac = { magnitude, phase }
    } else {
      const match = field.match(/^(sin|pulse|pwl)\s*\(([\s\S]*)\)$/i)
      if (match) {
        const args = splitSourceFields(match[2]!)
        const kind = match[1]!.toLowerCase()
        if (
          (kind === "sin" && (args.length < 3 || args.length > 6)) ||
          (kind === "pulse" && (args.length < 2 || args.length > 7)) ||
          (kind === "pwl" && (args.length < 2 || args.length % 2 !== 0)) ||
          args.some((arg) => arg.includes("="))
        ) {
          values.transient = new PreservedSourceWaveform(field)
          continue
        }
        switch (match[1]!.toLowerCase()) {
          case "sin":
            values.transient = new Sin({
              offset: args[0] ?? "",
              amplitude: args[1] ?? "",
              frequency: args[2] ?? "",
              delay: args[3],
              damping: args[4],
              phase: args[5],
            })
            break
          case "pulse":
            values.transient = new Pulse({
              initial: args[0] ?? "",
              pulsed: args[1] ?? "",
              delay: args[2],
              rise: args[3],
              fall: args[4],
              width: args[5],
              period: args[6],
            })
            break
          case "pwl": {
            const points: Array<[string, string]> = []
            for (let n = 0; n + 1 < args.length; n += 2)
              points.push([args[n]!, args[n + 1]!])
            values.transient = new Pwl(points)
            break
          }
        }
      } else if (index === 0) values.dc = field
    }
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
