import {
  SpiceCard,
  type SpiceNode,
  type SpiceNodeInit,
  type SpiceSerializeOptions,
} from "../ast"
import {
  NodeRef,
  ParamList,
  type NodeRefInput,
  type ParamsInput,
  normalizeNodeRef,
} from "../values"

export abstract class ElementCard extends SpiceCard {
  readonly cardKind = "element" as const
  name: string
  nodes: NodeRef[]
  params: ParamList

  constructor(
    init: SpiceNodeInit & {
      name: string
      nodes?: NodeRefInput[]
      params?: ParamsInput
    },
  ) {
    super(init)
    this.name = init.name
    this.nodes = (init.nodes ?? []).map(normalizeNodeRef)
    this.params = new ParamList(init.params)
  }

  renameNode(from: string, to: string): void {
    for (const node of this.nodes) {
      if (node.name === from) node.name = to
    }
  }

  getChildren(): SpiceNode[] {
    return []
  }

  protected formatParts(
    parts: Array<string | undefined>,
    options?: SpiceSerializeOptions,
  ): string {
    if (options?.format !== "pretty" && this.originalSource !== undefined) {
      return this.originalSource
    }
    const paramString = this.params.getString(options)
    return [...parts, paramString || undefined]
      .filter((part): part is string => part !== undefined && part.length > 0)
      .join(" ")
  }
}
