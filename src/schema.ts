// src/schema.ts
import { Type, type Static } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";
import { write, file } from "bun";

// 1. Define your runtime schema (removed "as TObject" to preserve type inference)
export const DataSchema = Type.Object({
  name: Type.String(),
  level: Type.Number(),
  xp: Type.Number(),
  hp: Type.Number(),
  max_hp: Type.Number(),
  weapons: Type.Record(
    Type.String(),
    Type.Object({
      name: Type.String(),
      damage: Type.Number(),
      durability: Type.Number(),
    })
  ),
});

// 2. Infer the type cleanly from the schema
export type IData = Static<typeof DataSchema>;

// 3. Define the self-validating data class
export class Data implements IData {
  name!: string;
  level!: number;
  xp!: number;
  hp!: number;
  max_hp!: number;
  weapons!: IData['weapons'];

  constructor(data: unknown) {
    // Ensure data exists and matches the schema before proceeding
    if (!data || !Value.Check(DataSchema, data)) {
      const errorArray = Value.Errors(DataSchema, data ?? {});
      const errors = [...errorArray]
        .map(e => `${e.path}: ${e.message}`)
        .join(', ');
      throw new Error(`Save file validation failed: ${errors}`);
    }
    
    // Safely assign properties now that validation has passed
    Object.assign(this, data);
  }
}

const SCRAMBLE_BYTE = 42;

export async function save(gameData: Data, filePath: string): Promise<void> {
  const jsonString = JSON.stringify(gameData);
  const bytes = new TextEncoder().encode(jsonString);
  // Inside save()
  for (let i = 0; i < bytes.length; i++) {
    // Added '!' after bytes[i] on the right side
    bytes[i] = bytes[i]! ^ SCRAMBLE_BYTE; 
  }
  await write(filePath, bytes);
}

export async function load(filePath: string | undefined): Promise<Data | null> {
  if (!filePath) {
    console.error("❌ No path provided to load.");
    return null;
  }

  const bunFile = file(filePath);
  if (!await bunFile.exists()) return null;

  try {
    const buffer = await bunFile.arrayBuffer();
    const bytes = new Uint8Array(buffer);

    // Inside load()
    for (let i = 0; i < bytes.length; i++) {
      // Added '!' after bytes[i] on the right side
      bytes[i] = bytes[i]! ^ SCRAMBLE_BYTE; 
    } 

    const jsonString = new TextDecoder().decode(bytes);
    return new Data(JSON.parse(jsonString));
  } catch (error) {
    console.error("❌ Failed to load save file:", error);
    return null;
  }
}

load().then((data) => {
  if (data) {
    console.log("✅ Save file loaded successfully:", data);
  } else {
    console.log("⚠️ No save file found, starting fresh.");
  }

  var datasdf = data;

  console.log("Loaded data:", datasdf?.name);
}).catch((error) => {
  console.error("❌ Error loading save file:", error);
})