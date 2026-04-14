import { LoginCard } from '../components/LoginCard';

export default function AdminLoginPage() {
  return (
    <LoginCard
      role="ADMIN"
      title="Admin sign in"
      subtitle="Manage platform data and monitor all schools."
      redirectPath="/admin"
    />
  );
}
