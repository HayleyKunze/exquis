/* eslint-disable */
/**
 * This file was automatically generated by scripts/manifest/validate-ts.mustache.
 * DO NOT MODIFY IT BY HAND. Instead, modify scripts/manifest/validate-ts.mustache,
 * and run node ./scripts/manifest/generateFormatTypes.js to regenerate this file.
 */
import {
  AnyWrapManifest,
  WrapManifestVersions,
  WrapManifestSchema_0_1
} from ".";


import {
  Schema,
  Validator,
  ValidationError,
  ValidatorResult
} from "jsonschema";
import { resolve, $Refs } from "@apidevtools/json-schema-ref-parser";
// Workaround: https://github.com/APIDevTools/json-schema-ref-parser/issues/139#issuecomment-940500698
import $RefParser from '@apidevtools/json-schema-ref-parser';
$RefParser.resolve = $RefParser.resolve.bind($RefParser);

type WrapManifestSchemas = {
  [key in WrapManifestVersions]: Schema | undefined
};

const schemas: WrapManifestSchemas = {
  // NOTE: Patch fix for backwards compatability
  "0.1.0": WrapManifestSchema_0_1,
  "0.1": WrapManifestSchema_0_1,
};


function throwIfErrors(result: ValidatorResult, version: string) {
  if (result.errors.length) {
    throw new Error([
      `Validation errors encountered while sanitizing WrapManifest version ${version}`,
      ...result.errors.map((error: ValidationError) => error.toString())
    ].join("\n"));
  }
}

export async function validateWrapManifest(
  manifest: AnyWrapManifest,
  extSchema: Schema | undefined = undefined
): Promise<void> {
  const schema = schemas[manifest.version as WrapManifestVersions];

  if (!schema) {
    throw new Error(`Unrecognized WrapManifest schema version "${manifest.version}"\nmanifest: ${JSON.stringify(manifest, null, 2)}`);
  }

  const refs: $Refs = await resolve(schema as any);

  const validator = new Validator();
  validator.addSchema(schema);

  const resolveRefs = () => {
    const unresolvedRef = validator.unresolvedRefs.shift();
    if (!unresolvedRef) return;

    const relRefIdx = unresolvedRef.indexOf("#");
    const relRef = unresolvedRef.slice(relRefIdx);

    const resolvedSchema = refs.get(relRef);
    if (!resolvedSchema) throw new Error(`Failed to resolve the ref: ${relRef}`);
    validator.addSchema(resolvedSchema as Schema, unresolvedRef);

    resolveRefs();
  }
  
  resolveRefs();

  throwIfErrors(validator.validate(manifest, schema), manifest.version);

  if (extSchema) {
    throwIfErrors(validator.validate(manifest, extSchema), manifest.version);
  }
}