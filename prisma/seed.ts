import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const systemItemTypes = [
  {
    id: "type-snippet",
    name: "Snippets",
    icon: "code",
    color: "blue",
    isSystem: true,
  },
  {
    id: "type-prompt",
    name: "Prompts",
    icon: "sparkles",
    color: "purple",
    isSystem: true,
  },
  {
    id: "type-command",
    name: "Commands",
    icon: "terminal",
    color: "orange",
    isSystem: true,
  },
  {
    id: "type-note",
    name: "Notes",
    icon: "file-text",
    color: "yellow",
    isSystem: true,
  },
  {
    id: "type-file",
    name: "Files",
    icon: "file",
    color: "gray",
    isSystem: true,
  },
  {
    id: "type-image",
    name: "Images",
    icon: "image",
    color: "pink",
    isSystem: true,
  },
  {
    id: "type-url",
    name: "Links",
    icon: "link",
    color: "cyan",
    isSystem: true,
  },
] as const;

async function main() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  const adapter = new PrismaPg({ connectionString });
  const prisma = new PrismaClient({ adapter });

  try {
    for (const itemType of systemItemTypes) {
      await prisma.itemType.upsert({
        where: { id: itemType.id },
        update: {
          name: itemType.name,
          icon: itemType.icon,
          color: itemType.color,
          isSystem: true,
          userId: null,
        },
        create: {
          id: itemType.id,
          name: itemType.name,
          icon: itemType.icon,
          color: itemType.color,
          isSystem: true,
        },
      });
    }

    console.log(`Seeded ${systemItemTypes.length} system item types`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
