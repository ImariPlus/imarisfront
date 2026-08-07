import { useState } from "react";
import { jwtDecode } from "jwt-decode";
import FormClinicalStaff from "./clinical-staff/form.clinicalStaff";
import ListClinicalStaff from "./clinical-staff/list.clinicalStaff";
import "../styles/ClinicalStaff.css";

interface JwtPayload { id: string; role: string; }

export default function ClinicalStaff() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const token = localStorage.getItem("token");
  let userRole = "USER";
  if (token) {
    try {
      userRole = jwtDecode<JwtPayload>(token).role;
    } catch {
      // Failed to decode token
    }
  }
  const canAdd = userRole === "ADMIN";

  return (
    <div className="page">
      <div className="page-header">
        <h2>Clinical Staff</h2>
        <p>Manage doctors, nurses, and lab technicians linked to patient transactions</p>
      </div>

      <div className="split-layout">
        {canAdd && (
          <aside>
            <FormClinicalStaff onSuccess={() => setRefreshTrigger((p) => p + 1)} />
          </aside>
        )}
        <main>
          <ListClinicalStaff key={refreshTrigger} refreshTrigger={refreshTrigger} />
        </main>
      </div>
    </div>
  );
}