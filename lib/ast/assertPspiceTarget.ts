import type { SpiceSerializeOptions } from "./types"

export function assertPspiceTarget(
  options: SpiceSerializeOptions | undefined,
  construct: string,
): void {
  const targetDialect = options?.dialect ?? "generic"
  if (targetDialect !== "pspice") {
    throw new Error(
      `PSpice-only construct ${construct} cannot be serialized to target dialect "${targetDialect}". Serialize with { dialect: "pspice" } or translate/remove the construct before exporting.`,
    )
  }
}
