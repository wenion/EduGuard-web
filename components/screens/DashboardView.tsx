"use client";

import { useEffect, useMemo, useState } from "react";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
    <Card>
      <CardHeader>
        <CardTitle>Unit Selection</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Unit Code</TableHead>
              <TableHead>Unit Name</TableHead>
              <TableHead>Semester</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {units.map((unit) => (
              <TableRow
                className="cursor-pointer"
                key={unit.unit_id}
                data-state={selectedId === unit.unit_id && "selected"}
              >
                <TableCell>{unit.unit_code}</TableCell>
                <TableCell>{unit.unit_name}</TableCell>
                <TableCell>{unit.semester}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter className="justify-end">
        <CardAction onClick={backAll}>Back to all units</CardAction>
      </CardFooter>
    </Card>
  );
}
