import ProgramsManagement from "@/components/programs/programs-management";

export default function GovernmentProgramsManagementPage() {
  return (
    <ProgramsManagement
      allowedRoles={["GOVERNMENT", "ADMIN"]}
      loginPath="/login/government"
      dashboardPath="/government"
      heading="Government Programs and Schemes Management"
      subheading="Maintain full scheme details with practical content, data requirements, and official links."
      showPlatformHeader
      navLinks={[
        { label: "Dashboard", href: "/government" },
        { label: "Schools", href: "/government/schools" },
        { label: "Reports", href: "/government/reports" },
        { label: "Users", href: "/government/users" },
      ]}
    />
  );
}
