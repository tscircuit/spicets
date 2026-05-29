import { SpiceCard, type SpiceNode, type SpiceNodeInit, type SpiceSerializeOptions } from "./ast"
import {
  NodeRef,
  ParamList,
  SpiceValue,
  type AcSpec,
  type AcSpecInput,
  type NodeRefInput,
  type ParamsInput,
  type SourceWaveformInput,
  type SpiceValueInput,
  normalizeAcSpec,
  normalizeNodeRef,
  normalizeValue,
} from "./values"

export abstract class ElementCard extends SpiceCard {
  readonly cardKind = "element" as const
  name: string
  nodes: NodeRef[]
  params: ParamList

  constructor(init: SpiceNodeInit & {
    name: string
    nodes?: NodeRefInput[]
    params?: ParamsInput
  }) {
    super(init)
    this.name = init.name
    this.nodes = (init.nodes ?? []).map(normalizeNodeRef)
    this.params = new ParamList(init.params)
  }

  renameNode(from: string, to: string): this {
    for (const node of this.nodes) {
      if (node.name === from) node.name = to
    }
    return this
  }

  getChildren(): SpiceNode[] {
    return []
  }

  protected formatParts(parts: Array<string | undefined>, options?: SpiceSerializeOptions): string {
    if (options?.format !== "pretty" && this.originalSource !== undefined) {
      return this.originalSource
    }
    const paramString = this.params.getString(options)
    return [...parts, paramString || undefined]
      .filter((part): part is string => part !== undefined && part.length > 0)
      .join(" ")
  }
}

export class Resistor extends ElementCard {
  readonly type = "resistor" as const
  resistance: SpiceValue

  constructor(init: SpiceNodeInit & {
    name: string
    nodes: [NodeRefInput, NodeRefInput]
    resistance: SpiceValueInput
    params?: ParamsInput
  }) {
    super({
      ...init,
      nodes: init.nodes.filter((node): node is NodeRefInput => node !== undefined),
    })
    this.resistance = normalizeValue(init.resistance)
  }

  toSource(options?: SpiceSerializeOptions): string {
    return this.formatParts(
      [this.name, ...this.nodes.map((node) => node.getString()), this.resistance.getString()],
      options,
    )
  }
}

export class Capacitor extends ElementCard {
  readonly type = "capacitor" as const
  capacitance: SpiceValue
  initialCondition?: SpiceValue

  constructor(init: SpiceNodeInit & {
    name: string
    nodes: [NodeRefInput, NodeRefInput]
    capacitance: SpiceValueInput
    ic?: SpiceValueInput
    params?: ParamsInput
  }) {
    super(init)
    this.capacitance = normalizeValue(init.capacitance)
    this.initialCondition =
      init.ic === undefined ? undefined : normalizeValue(init.ic)
  }

  toSource(options?: SpiceSerializeOptions): string {
    return this.formatParts(
      [
        this.name,
        ...this.nodes.map((node) => node.getString()),
        this.capacitance.getString(),
        this.initialCondition === undefined
          ? undefined
          : `IC=${this.initialCondition.getString()}`,
      ],
      options,
    )
  }
}

export class Inductor extends ElementCard {
  readonly type = "inductor" as const
  inductance: SpiceValue
  initialCondition?: SpiceValue

  constructor(init: SpiceNodeInit & {
    name: string
    nodes: [NodeRefInput, NodeRefInput]
    inductance: SpiceValueInput
    ic?: SpiceValueInput
    params?: ParamsInput
  }) {
    super(init)
    this.inductance = normalizeValue(init.inductance)
    this.initialCondition =
      init.ic === undefined ? undefined : normalizeValue(init.ic)
  }

  toSource(options?: SpiceSerializeOptions): string {
    return this.formatParts(
      [
        this.name,
        ...this.nodes.map((node) => node.getString()),
        this.inductance.getString(),
        this.initialCondition === undefined
          ? undefined
          : `IC=${this.initialCondition.getString()}`,
      ],
      options,
    )
  }
}

abstract class IndependentSource extends ElementCard {
  dc?: SpiceValue
  ac?: AcSpec
  transient?: SourceWaveformInput

  constructor(init: SpiceNodeInit & {
    name: string
    nodes: [NodeRefInput, NodeRefInput]
    dc?: SpiceValueInput
    ac?: AcSpecInput
    transient?: SourceWaveformInput
    params?: ParamsInput
  }) {
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
      if (this.ac.magnitude !== undefined) parts.push(this.ac.magnitude.getString())
      if (this.ac.phase !== undefined) parts.push(this.ac.phase.getString())
    }
    if (this.transient !== undefined) parts.push(this.transient.toSource())
    return parts
  }
}

export class VoltageSource extends IndependentSource {
  readonly type = "voltage_source" as const

  toSource(options?: SpiceSerializeOptions): string {
    return this.formatParts(this.sourceParts(), options)
  }
}

export class CurrentSource extends IndependentSource {
  readonly type = "current_source" as const

  toSource(options?: SpiceSerializeOptions): string {
    return this.formatParts(this.sourceParts(), options)
  }
}

export class Diode extends ElementCard {
  readonly type = "diode" as const
  model: string

  constructor(init: SpiceNodeInit & {
    name: string
    nodes: [NodeRefInput, NodeRefInput]
    model: string
    params?: ParamsInput
  }) {
    super(init)
    this.model = init.model
  }

  toSource(options?: SpiceSerializeOptions): string {
    return this.formatParts(
      [this.name, ...this.nodes.map((node) => node.getString()), this.model],
      options,
    )
  }
}

export class Bjt extends ElementCard {
  readonly type = "bjt" as const
  model: string

  constructor(init: SpiceNodeInit & {
    name: string
    nodes: [collector: NodeRefInput, base: NodeRefInput, emitter: NodeRefInput, substrate?: NodeRefInput]
    model: string
    params?: ParamsInput
  }) {
    super({
      ...init,
      nodes: init.nodes.filter((node): node is NodeRefInput => node !== undefined),
    })
    this.model = init.model
  }

  toSource(options?: SpiceSerializeOptions): string {
    return this.formatParts(
      [this.name, ...this.nodes.map((node) => node.getString()), this.model],
      options,
    )
  }
}

export class Mosfet extends ElementCard {
  readonly type = "mosfet" as const
  model: string

  constructor(init: SpiceNodeInit & {
    name: string
    nodes: [drain: NodeRefInput, gate: NodeRefInput, source: NodeRefInput, bulk: NodeRefInput]
    model: string
    params?: ParamsInput
  }) {
    super(init)
    this.model = init.model
  }

  toSource(options?: SpiceSerializeOptions): string {
    return this.formatParts(
      [this.name, ...this.nodes.map((node) => node.getString()), this.model],
      options,
    )
  }
}

export class Vcvs extends ElementCard {
  readonly type = "vcvs" as const
  gain: SpiceValue

  constructor(init: SpiceNodeInit & {
    name: string
    output: [NodeRefInput, NodeRefInput]
    control: [NodeRefInput, NodeRefInput]
    gain: SpiceValueInput
  }) {
    super({ ...init, nodes: [...init.output, ...init.control] })
    this.gain = normalizeValue(init.gain)
  }

  toSource(options?: SpiceSerializeOptions): string {
    return this.formatParts(
      [this.name, ...this.nodes.map((node) => node.getString()), this.gain.getString()],
      options,
    )
  }
}

export class Vccs extends ElementCard {
  readonly type = "vccs" as const
  transconductance: SpiceValue

  constructor(init: SpiceNodeInit & {
    name: string
    output: [NodeRefInput, NodeRefInput]
    control: [NodeRefInput, NodeRefInput]
    transconductance: SpiceValueInput
  }) {
    super({ ...init, nodes: [...init.output, ...init.control] })
    this.transconductance = normalizeValue(init.transconductance)
  }

  toSource(options?: SpiceSerializeOptions): string {
    return this.formatParts(
      [
        this.name,
        ...this.nodes.map((node) => node.getString()),
        this.transconductance.getString(),
      ],
      options,
    )
  }
}

export class Ccvs extends ElementCard {
  readonly type = "ccvs" as const
  source: string
  transresistance: SpiceValue

  constructor(init: SpiceNodeInit & {
    name: string
    output: [NodeRefInput, NodeRefInput]
    source: string
    transresistance: SpiceValueInput
  }) {
    super({ ...init, nodes: init.output })
    this.source = init.source
    this.transresistance = normalizeValue(init.transresistance)
  }

  toSource(options?: SpiceSerializeOptions): string {
    return this.formatParts(
      [
        this.name,
        ...this.nodes.map((node) => node.getString()),
        this.source,
        this.transresistance.getString(),
      ],
      options,
    )
  }
}

export class Cccs extends ElementCard {
  readonly type = "cccs" as const
  source: string
  gain: SpiceValue

  constructor(init: SpiceNodeInit & {
    name: string
    output: [NodeRefInput, NodeRefInput]
    source: string
    gain: SpiceValueInput
  }) {
    super({ ...init, nodes: init.output })
    this.source = init.source
    this.gain = normalizeValue(init.gain)
  }

  toSource(options?: SpiceSerializeOptions): string {
    return this.formatParts(
      [
        this.name,
        ...this.nodes.map((node) => node.getString()),
        this.source,
        this.gain.getString(),
      ],
      options,
    )
  }
}

export class SubcktInstance extends ElementCard {
  readonly type = "subckt_instance" as const
  subckt: string

  constructor(init: SpiceNodeInit & {
    name: string
    nodes: NodeRefInput[]
    subckt: string
    params?: ParamsInput
  }) {
    super(init)
    this.subckt = init.subckt
  }

  toSource(options?: SpiceSerializeOptions): string {
    return this.formatParts(
      [this.name, ...this.nodes.map((node) => node.getString()), this.subckt],
      options,
    )
  }
}

export class UnknownElementCard extends ElementCard {
  readonly type = "unknown_element" as const
  designator: string
  tokens: string[]

  constructor(init: SpiceNodeInit & {
    name: string
    designator: string
    nodes?: NodeRefInput[]
    tokens: string[]
  }) {
    super(init)
    this.designator = init.designator
    this.tokens = init.tokens
  }

  toSource(options?: SpiceSerializeOptions): string {
    return this.formatParts([this.name, ...this.tokens], options)
  }
}
