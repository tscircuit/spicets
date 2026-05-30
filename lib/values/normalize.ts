import { NodeRef } from "./NodeRef"
import { SpiceExpression } from "./SpiceExpression"
import { SpiceValue } from "./SpiceValue"
import type { AcSpec, AcSpecInput, NodeRefInput, SpiceValueInput } from "./types"

export function normalizeNodeRef(input: NodeRefInput): NodeRef {
  return input instanceof NodeRef ? input : new NodeRef(input)
}

export function normalizeValue(input: SpiceValueInput): SpiceValue {
  if (input instanceof SpiceValue) return input
  if (input instanceof SpiceExpression) return new SpiceValue(input.getString())
  return new SpiceValue(input)
}

export function normalizeAcSpec(input: AcSpecInput): AcSpec {
  if (
    typeof input === "object" &&
    !(input instanceof SpiceValue) &&
    !(input instanceof SpiceExpression)
  ) {
    return {
      magnitude:
        input.magnitude === undefined ? undefined : normalizeValue(input.magnitude),
      phase: input.phase === undefined ? undefined : normalizeValue(input.phase),
    }
  }
  return { magnitude: normalizeValue(input) }
}
