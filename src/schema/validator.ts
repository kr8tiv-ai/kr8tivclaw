import Ajv from "ajv";
import type { HarnessConfig } from "../types.js";
import schema from "./harness.schema.json" assert { type: "json" };

const ajv = new Ajv({ allErrors: true, strict: true });
const validate = ajv.compile<HarnessConfig>(schema);

export function validateHarness(input: unknown): HarnessConfig {
  if (validate(input)) {
    return input;
  }

  const details = (validate.errors ?? [])
    .map((err) => `${err.instancePath || "/"} ${err.message}`)
    .join("; ");
  throw new Error(`Invalid harness.yaml: ${details}`);
}
