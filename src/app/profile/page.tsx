import { AccountInformationCard } from "@/components/profile/account-information-card";
import { UsageStatisticsCard } from "@/components/profile/usage-statistics-card";
import { getProfileData } from "@/lib/db/profile";

export default async function ProfilePage() {
  const { user, stats, itemTypeCounts } = await getProfileData();

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold md:text-3xl">Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your account settings
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <AccountInformationCard
          name={user.name}
          email={user.email}
          image={user.image}
          createdAt={user.createdAt.toISOString()}
          hasPassword={user.hasPassword}
        />
        <UsageStatisticsCard
          itemCount={stats.itemCount}
          collectionCount={stats.collectionCount}
          itemTypeCounts={itemTypeCounts}
        />
      </div>
    </div>
  );
}
