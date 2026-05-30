import { SpiceNode } from "./SpiceNode"
import type { SpiceCardKind, SpiceNodeInit } from "./types"

export abstract class SpiceCard extends SpiceNode {
  abstract readonly cardKind: SpiceCardKind
  originalSource?: string

  constructor(init: SpiceNodeInit = {}) {
    super(init)
    this.originalSource = init.originalSource
  }
}
