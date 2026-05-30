import { SpiceNode } from "../ast"

export abstract class SourceWaveform extends SpiceNode {
  getChildren(): SpiceNode[] {
    return []
  }
}
