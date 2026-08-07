import {
  PageContainer,
  PageContent,
  PageHeader,
} from "@/components/layout/page-container";
import { AccountActionsCard } from "@/components/settings/account-actions-card";
import { getSettingsData } from "@/lib/db/settings";

export default async function SettingsPage() {
  const { user } = await getSettingsData();

  return (
    <PageContainer>
      <PageHeader
        title="Settings"
        description="Manage your account security and preferences"
      />

      <PageContent>
        <AccountActionsCard email={user.email} hasPassword={user.hasPassword} />
      </PageContent>
    </PageContainer>
  );
}
