import { SpiceNode } from "./SpiceNode"

export abstract class SpiceTrivia extends SpiceNode {
  abstract override readonly type: "comment" | "blank"
}
