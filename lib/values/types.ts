import type { NodeRef } from "./NodeRef"
import type { ParamList } from "./ParamList"
import type { SourceWaveform } from "./SourceWaveform"
import type { SpiceExpression } from "./SpiceExpression"
import type { SpiceValue } from "./SpiceValue"

export type NodeRefInput = string | NodeRef
export type SpiceValueInput = string | number | SpiceValue | SpiceExpression

export type ParamsInput =
  | Record<string, SpiceValueInput>
  | Array<[string, SpiceValueInput]>
  | ParamList

export type SourceWaveformInput = SourceWaveform

export interface AcSpec {
  magnitude?: SpiceValue
  phase?: SpiceValue
}

export type AcSpecInput =
  | SpiceValueInput
  | {
      magnitude?: SpiceValueInput
      phase?: SpiceValueInput
    }
