import { useState } from "react";
import ClinicalStaffTab from "./clinical-staff/list.clinicalStaff";
import FormClinicalStaff from "./clinical-staff/form.clinicalStaff";
import UsersTab from "./users/list.users";
import FormUsers from "./users/form.users";
import { jwtDecode } from "jwt-decode";
import "../styles/users.css";
import "../styles/Settings.css";

interface JwtPayload { id: string; role: string; }

type Tab = "clinical-staff" | "staff-accounts";

export default function Settings() {
  const [activeTab, setActiveTab] = useState<Tab>("clinical-staff");
  const [refreshCS, setRefreshCS] = useState(0);
  const [refreshUsers, setRefreshUsers] = useState(0);

  const token = localStorage.getItem("token");
  let userRole = "USER";
  let userId = "";
  if (token) {
    try {
      const decoded = jwtDecode<JwtPayload>(token);
      userRole = decoded.role;
      userId = decoded.id;
    } catch {
      // ignore invalid token
    }
  }

  if (userRole !== "ADMIN") {
    return (
      <div className="page">
        <p className="empty-state">Only administrators can access settings.</p>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <h2>Settings</h2>
        <p>Manage clinical staff and system accounts</p>
      </div>

      {/* Tabs */}
      <div className="settings-tabs">
        <button
          className={`settings-tab ${activeTab === "clinical-staff" ? "active" : ""}`}
          onClick={() => setActiveTab("clinical-staff")}
        >
Clinical Staff</button>
        <button
          className={`settings-tab ${activeTab === "staff-accounts" ? "active" : ""}`}
          onClick={() => setActiveTab("staff-accounts")}
        >
          System Users
        </button>
      </div>

      {/* Tab content */}
      <div className="split-layout">
        {activeTab === "clinical-staff" ? (
          <>
            <aside>
              <FormClinicalStaff onSuccess={() => setRefreshCS((p) => p + 1)} />
            </aside>
            <main>
              <ClinicalStaffTab refreshTrigger={refreshCS} />
            </main>
          </>
        ) : (
          <>
            <aside>
              <FormUsers onSuccess={() => setRefreshUsers((p) => p + 1)} />
            </aside>
            <main>
              <UsersTab currentUserId={userId} refreshTrigger={refreshUsers} />
            </main>
          </>
        )}
      </div>
    </div>
  );
}