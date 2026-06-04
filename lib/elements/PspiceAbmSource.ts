import {
  assertPspiceTarget,
  type SpiceNodeInit,
  type SpiceSerializeOptions,
} from "../ast"
import type { SpiceLogicalCard } from "../tokens"
import { SpiceTokenCard } from "../tokens/fromTokens"
import { ElementCard } from "./ElementCard"

export type PspiceAbmForm = "VALUE" | "TABLE" | "LAPLACE" | "FREQ" | "CHEBYSHEV"

const pspiceAbmForms = new Set<string>([
  "VALUE",
  "TABLE",
  "LAPLACE",
  "FREQ",
  "CHEBYSHEV",
])

export function isPspiceAbmForm(
  value: string | undefined,
): value is PspiceAbmForm {
  return value !== undefined && pspiceAbmForms.has(value.toUpperCase())
}

function assertPspiceAbmTarget(
  options: SpiceSerializeOptions | undefined,
  form: PspiceAbmForm,
  construct: string,
): void {
  const targetDialect = options?.dialect ?? "generic"
  if (
    targetDialect === "pspice" ||
    (targetDialect === "ngspice" && (form === "VALUE" || form === "TABLE"))
  ) {
    return
  }
  assertPspiceTarget(options, construct)
}

type PspiceAbmSourceInit = SpiceNodeInit & {
  name: string
  output: [string, string]
  form: PspiceAbmForm
  args: string[]
}

export class PspiceAbmVoltageSource extends ElementCard {
  readonly type = "pspice_abm_voltage_source" as const
  form: PspiceAbmForm
  args: string[]

  constructor(init: PspiceAbmSourceInit) {
    super({ ...init, nodes: init.output })
    this.form = init.form
    this.args = init.args
  }

  static fromTokenCard(tokens: SpiceTokenCard): PspiceAbmVoltageSource {
    return new PspiceAbmVoltageSource({
      name: tokens.head(),
      output: [tokens.arg(0) ?? "", tokens.arg(1) ?? ""],
      form: tokens.arg(2)?.toUpperCase() as PspiceAbmForm,
      args: tokens.argsAfter(3),
      originalSource: tokens.originalSource,
    })
  }

  toSource(options?: SpiceSerializeOptions): string {
    assertPspiceAbmTarget(
      options,
      this.form,
      `${this.form} behavioral voltage source`,
    )
    return this.formatParts(
      [
        this.name,
        ...this.nodes.map((node) => node.getString()),
        this.form,
        ...this.args,
      ],
      options,
    )
  }
}

export class PspiceAbmCurrentSource extends ElementCard {
  readonly type = "pspice_abm_current_source" as const
  form: PspiceAbmForm
  args: string[]

  constructor(init: PspiceAbmSourceInit) {
    super({ ...init, nodes: init.output })
    this.form = init.form
    this.args = init.args
  }

  static fromTokenCard(tokens: SpiceTokenCard): PspiceAbmCurrentSource {
    return new PspiceAbmCurrentSource({
      name: tokens.head(),
      output: [tokens.arg(0) ?? "", tokens.arg(1) ?? ""],
      form: tokens.arg(2)?.toUpperCase() as PspiceAbmForm,
      args: tokens.argsAfter(3),
      originalSource: tokens.originalSource,
    })
  }

  toSource(options?: SpiceSerializeOptions): string {
    assertPspiceAbmTarget(
      options,
      this.form,
      `${this.form} behavioral current source`,
    )
    return this.formatParts(
      [
        this.name,
        ...this.nodes.map((node) => node.getString()),
        this.form,
        ...this.args,
      ],
      options,
    )
  }
}

export function parsePspiceAbmVoltageSource(
  card: SpiceLogicalCard,
): PspiceAbmVoltageSource {
  return PspiceAbmVoltageSource.fromTokenCard(SpiceTokenCard.from(card))
}

export function parsePspiceAbmCurrentSource(
  card: SpiceLogicalCard,
): PspiceAbmCurrentSource {
  return PspiceAbmCurrentSource.fromTokenCard(SpiceTokenCard.from(card))
}
