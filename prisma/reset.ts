import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../src/generated/prisma/client";

async function main() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  const adapter = new PrismaPg({ connectionString });
  const prisma = new PrismaClient({ adapter });

  try {
    // Deleted in dependency order: children before parents.
    // ItemType uses onDelete: Restrict on Item, so items must go first.
    const results = await prisma.$transaction([
      prisma.itemTag.deleteMany(),
      prisma.item.deleteMany(),
      prisma.collection.deleteMany(),
      prisma.tag.deleteMany(),
      prisma.itemType.deleteMany(),
      prisma.account.deleteMany(),
      prisma.session.deleteMany(),
      prisma.verificationToken.deleteMany(),
      prisma.user.deleteMany(),
    ]);

    const [
      itemTags,
      items,
      collections,
      tags,
      itemTypes,
      accounts,
      sessions,
      verificationTokens,
      users,
    ] = results;

    console.log("Database reset complete:");
    console.log(`  ItemTag: ${itemTags.count}`);
    console.log(`  Item: ${items.count}`);
    console.log(`  Collection: ${collections.count}`);
    console.log(`  Tag: ${tags.count}`);
    console.log(`  ItemType: ${itemTypes.count}`);
    console.log(`  Account: ${accounts.count}`);
    console.log(`  Session: ${sessions.count}`);
    console.log(`  VerificationToken: ${verificationTokens.count}`);
    console.log(`  User: ${users.count}`);
    console.log("\nRun `npm run db:seed` to reseed.");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
