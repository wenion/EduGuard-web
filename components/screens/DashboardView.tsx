// components/screens/DashboardView.tsx
"use client";

import { useEffect, useMemo, useState } from "react";

import { useAuth } from "@/context/AuthContext";
import { fetchUserProfile } from "@/lib/authApi";

type Unit = {
  unit_id: number;
  unit_code: string;
  unit_name: string;
  semester: string;
};

export default function DashboardView({
  onBackAllUnits,           // optional: what to do on "Back to all units"
  onUnitSelect,             // optional: notify parent when a unit is selected
}: {
  onBackAllUnits?: () => void;
  onUnitSelect?: (unit: Unit | null) => void;
}) {
  const { user, isAuthenticated, authorizedFetch } = useAuth();
  const units = useMemo<Unit[]>(
    () => (user?.enrolled_units as Unit[] | undefined) ?? [],
    [user]
  );

  useEffect(() => {
    fetchUserProfile(authorizedFetch);
  }, [authorizedFetch])

  const [selectedId, setSelectedId] = useState<number | null>(null);

  const selectUnit = (u: Unit) => {
    setSelectedId(u.unit_id);
    onUnitSelect?.(u);
  };

  const backAll = () => {
    setSelectedId(null);
    onUnitSelect?.(null);
    onBackAllUnits?.();
  };

  if (!isAuthenticated) {
    return <p className="text-muted">Please sign in to view your units.</p>;
  }

  return (
    <section className="panel-section dashboard">
      <h2>Unit Selection</h2>

      <div className="content-area">
        <div className="table-responsive">
          <table className="table table-hover">
            <thead className="table-light">
              <tr>
                <th>Unit Code</th>
                <th>Unit Name</th>
                <th>Semester</th>
              </tr>
            </thead>

            <tbody id="unitList">
              {units.length === 0 && (
                <tr>
                  <td colSpan={3} className="text-muted">
                    No enrolled units found.
                  </td>
                </tr>
              )}

              {units.map((u) => {
                const active = u.unit_id === selectedId;
                return (
                  <tr
                    key={u.unit_id}
                    data-unit-id={u.unit_id}
                    className={`unit-select ${active ? "table-active" : ""}`}
                    style={{ cursor: "pointer" }}
                    onClick={() => selectUnit(u)}
                  >
                    <td>{u.unit_code}</td>
                    <td>{u.unit_name}</td>
                    <td>{u.semester}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="d-flex justify-content-end align-items-center">
          <button
            className="btn activity-btn hover-border-btn"
            id="all-unit-btn"
            type="button"
            onClick={backAll}
          >
            <span>Back to all units</span>
            {/* Requires bootstrap-icons CSS loaded globally */}
            <i className="bi bi-arrow-return-left" />
          </button>
        </div>
      </div>
    </section>
  );
}
