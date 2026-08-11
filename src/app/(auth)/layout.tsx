import { HomepageNavbar } from "@/components/marketing/homepage-navbar";
import { HomepageNavbarActions } from "@/components/marketing/homepage-navbar-actions";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <HomepageNavbar actions={<HomepageNavbarActions />} />
      <main id="main-content" className="pt-16">
        {children}
      </main>
    </>
  );
}
