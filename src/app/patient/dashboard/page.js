import HospitalSearch from "@/components/patient/HospitalSearch";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import SOSSection from "@/components/patient/SOSSection.js";

export default async function PatientDashboardHome() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Dashboard Overview</h2>
      <HospitalSearch/>
      {userId && <SOSSection userId={userId} />}
      <p>
        Welcome to your health management dashboard. Select an action from the
        sidebar to begin.
      </p>
    </div>
  );
}
