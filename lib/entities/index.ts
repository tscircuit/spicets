import { BaseSpiceNode, type SpiceNodeInit } from "../base-node"

export type SpiceLine =
  | SpiceElement
  | SpiceDirective
  | SpiceComment
  | SpiceBlankLine
  | UnknownSpiceLine

export interface SpiceElementInit extends SpiceNodeInit {
  name: string
  nodes?: string[]
  value?: string
  parameters?: string[]
}

export class SpiceElement extends BaseSpiceNode {
  readonly type = "element" as const
  name: string
  nodes: string[]
  value?: string
  parameters: string[]

  constructor(init: SpiceElementInit) {
    super(init)
    this.name = init.name
    this.nodes = init.nodes ?? []
    this.value = init.value
    this.parameters = init.parameters ?? []
  }

  getChildren(): BaseSpiceNode[] {
    return []
  }

  toSource(): string {
    if (this.raw !== undefined) return this.raw
    return [this.name, ...this.nodes, this.value, ...this.parameters]
      .filter((part): part is string => part !== undefined && part.length > 0)
      .join(" ")
  }
}

export interface SpiceDirectiveInit extends SpiceNodeInit {
  name: string
  args?: string[]
}

export class SpiceDirective extends BaseSpiceNode {
  readonly type = "directive" as const
  name: string
  args: string[]

  constructor(init: SpiceDirectiveInit) {
    super(init)
    this.name = init.name
    this.args = init.args ?? []
  }

  getChildren(): BaseSpiceNode[] {
    return []
  }

  toSource(): string {
    if (this.raw !== undefined) return this.raw
    return [this.name, ...this.args].join(" ")
  }
}

export interface SpiceCommentInit extends SpiceNodeInit {
  text: string
  marker?: "*" | ";"
}

export class SpiceComment extends BaseSpiceNode {
  readonly type = "comment" as const
  text: string
  marker: "*" | ";"

  constructor(init: SpiceCommentInit) {
    super(init)
    this.text = init.text
    this.marker = init.marker ?? "*"
  }

  getChildren(): BaseSpiceNode[] {
    return []
  }

  toSource(): string {
    if (this.raw !== undefined) return this.raw
    return `${this.marker}${this.text}`
  }
}

export class SpiceBlankLine extends BaseSpiceNode {
  readonly type = "blank_line" as const

  getChildren(): BaseSpiceNode[] {
    return []
  }

  toSource(): string {
    return this.raw ?? ""
  }
}

export interface UnknownSpiceLineInit extends SpiceNodeInit {
  text: string
}

export class UnknownSpiceLine extends BaseSpiceNode {
  readonly type = "unknown_line" as const
  text: string

  constructor(init: UnknownSpiceLineInit) {
    super(init)
    this.text = init.text
  }

  getChildren(): BaseSpiceNode[] {
    return []
  }

  toSource(): string {
    return this.raw ?? this.text
  }
}
