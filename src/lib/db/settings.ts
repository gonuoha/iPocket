import { cache } from "react";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import {
  parseEditorPreferences,
  type EditorPreferences,
} from "@/lib/editor-preferences";
import { getUserItemStats } from "@/lib/db/items";
import { prisma } from "@/lib/prisma";

export type SettingsData = {
  user: {
    email: string;
    hasPassword: boolean;
    isPro: boolean;
    stripeCustomerId: string | null;
  };
  usage: {
    itemCount: number;
    collectionCount: number;
  };
  editorPreferences: EditorPreferences;
};

export const getEditorPreferences = cache(
  async (userId: string): Promise<EditorPreferences> => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { editorPreferences: true },
    });

    return parseEditorPreferences(user?.editorPreferences);
  },
);

export const getSettingsData = cache(async (): Promise<SettingsData> => {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const [user, stats] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        email: true,
        password: true,
        isPro: true,
        stripeCustomerId: true,
        editorPreferences: true,
      },
    }),
    getUserItemStats(session.user.id),
  ]);

  if (!user?.email) {
    redirect("/api/auth/signout?callbackUrl=/sign-in");
  }

  return {
    user: {
      email: user.email,
      hasPassword: Boolean(user.password),
      isPro: user.isPro,
      stripeCustomerId: user.stripeCustomerId,
    },
    usage: {
      itemCount: stats.itemCount,
      collectionCount: stats.collectionCount,
    },
    editorPreferences: parseEditorPreferences(user.editorPreferences),
  };
});

export async function updateEditorPreferences(
  userId: string,
  preferences: EditorPreferences,
): Promise<EditorPreferences> {
  const updated = await prisma.user.update({
    where: { id: userId },
    data: { editorPreferences: preferences },
    select: { editorPreferences: true },
  });

  return parseEditorPreferences(updated.editorPreferences);
}
