import ProgramsManagement from "@/components/programs/programs-management";

export default function AdminProgramsManagementPage() {
  return (
    <ProgramsManagement
      allowedRoles={["ADMIN"]}
      loginPath="/login/admin"
      dashboardPath="/admin"
      heading="Admin Programs and Schemes Management"
      subheading="Add, edit, and delete every detail of government programs used across the platform."
    />
  );
}
