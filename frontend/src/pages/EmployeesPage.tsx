import { EmployeeTable } from '@/components/employees/EmployeeTable';
import PeerNetworkGraph from '@/components/employees/PeerNetworkGraph';

export default function EmployeesPage() {
  return (
    <div className="space-y-6">
      <EmployeeTable />
      <PeerNetworkGraph />
    </div>
  );
}
