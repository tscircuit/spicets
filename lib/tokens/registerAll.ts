import { SpiceTokenClassRegistry } from "./SpiceTokenClassRegistry"
import {
  Ac,
  ControlBlock,
  Dc,
  End,
  Include,
  Lib,
  Model,
  Op,
  Options,
  Param,
  Save,
  Subckt,
  Temp,
  Tran,
  UnknownDotCommand,
} from "../directives"
import {
  Bjt,
  Capacitor,
  Cccs,
  Ccvs,
  CurrentSource,
  Diode,
  Inductor,
  Mosfet,
  Resistor,
  SubcktInstance,
  Vccs,
  Vcvs,
  VoltageSource,
} from "../elements"
import { BlankLine, Comment, RawCard } from "../trivia"

SpiceTokenClassRegistry.register("blank", BlankLine)
SpiceTokenClassRegistry.register("comment", Comment)
SpiceTokenClassRegistry.register("raw", RawCard)
SpiceTokenClassRegistry.register("error", RawCard)
SpiceTokenClassRegistry.register("number", RawCard)
SpiceTokenClassRegistry.register("operator", RawCard)
SpiceTokenClassRegistry.register("punctuation", RawCard)

SpiceTokenClassRegistry.register("R", Resistor)
SpiceTokenClassRegistry.register("C", Capacitor)
SpiceTokenClassRegistry.register("L", Inductor)
SpiceTokenClassRegistry.register("V", VoltageSource)
SpiceTokenClassRegistry.register("I", CurrentSource)
SpiceTokenClassRegistry.register("D", Diode)
SpiceTokenClassRegistry.register("Q", Bjt)
SpiceTokenClassRegistry.register("M", Mosfet)
SpiceTokenClassRegistry.register("E", Vcvs)
SpiceTokenClassRegistry.register("G", Vccs)
SpiceTokenClassRegistry.register("H", Ccvs)
SpiceTokenClassRegistry.register("F", Cccs)
SpiceTokenClassRegistry.register("X", SubcktInstance)

SpiceTokenClassRegistry.register(".end", End)
SpiceTokenClassRegistry.register(".op", Op)
SpiceTokenClassRegistry.register(".tran", Tran)
SpiceTokenClassRegistry.register(".ac", Ac)
SpiceTokenClassRegistry.register(".dc", Dc)
SpiceTokenClassRegistry.register(".param", Param)
SpiceTokenClassRegistry.register(".model", Model)
SpiceTokenClassRegistry.register(".include", Include)
SpiceTokenClassRegistry.register(".lib", Lib)
SpiceTokenClassRegistry.register(".options", Options)
SpiceTokenClassRegistry.register(".temp", Temp)
SpiceTokenClassRegistry.register(".save", Save)
SpiceTokenClassRegistry.register(".control", ControlBlock)
SpiceTokenClassRegistry.register(".subckt", Subckt)
SpiceTokenClassRegistry.register("__default__", UnknownDotCommand)
