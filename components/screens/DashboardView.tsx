"use client";

import { useEffect, useMemo, useRef, useState } from "react";

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
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { FeedbackSet } from "@/types/feedback";
import { fetchUserProfile, fetchUserFeedback } from "@/lib/authApi";
import { Separator } from "@radix-ui/react-separator";
import { FeedbackPanel } from "@/components/screens/FeedbackPanel";


// import { OverallLine, __PING__ } from "./LineChart";
// console.log("__PING__", __PING__);

import { overallEngagement, weeklyEngagement, assessmentPerformance } from "@/lib/userApi";
import { OverallLine } from "./LineChart";
import { WeeklyBar } from "@/components/screens/WeeklyBarChart";
// import { AssessmentBoxplot } from "@/components/screens/BoxplotChart";




type Unit = {
  unit_id: number;
  unit_code: string;
  unit_name: string;
  semester: string;
};
type TabKey = "analytical" | "prescriptive";

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

  const [data, setData] = useState<FeedbackSet>({ feedback_set: [] });

  const load = async () => {
    try {
      const res = await fetchUserFeedback(authorizedFetch, 4);
      const feedbackArr: FeedbackSet = res;
      setData(feedbackArr);
    } catch (e: any) {
      console.error("Failed to load feedback data:", e);
    }
  };

  useEffect(() => {
    load();
  }, []); // Load once on mount

  if (!isAuthenticated) {
    return <p className="text-muted">Please sign in to view your units.</p>;
  }

// ===== chart state =====
  const [showPeer, setShowPeer] = useState<boolean>(true);
  const [overall, setOverall] = useState<null | {
    show_peer: boolean;
    label: (string | number)[];
    user: number[];
    class: number[];
    pre_semester: number[];
    unit: string;
  }>(null);

  const [weekly, setWeekly] = useState<null | {
    show_peer: boolean;
    label: (string | number)[];
    user: number[];
    class: number[];
    pre_semester: number[];
    unit: string;
    weeks: (string | number)[];
    selected_week: string | number;
  }>(null);

  const [assessment, setAssessment] = useState<null | {
    show_peer: boolean;
    label: string[];
    user: number[];      // points
    class: any[];        // boxplot
    pre_semester: any[]; // boxplot
    unit: string;
  }>(null);

  const [selectedWeek, setSelectedWeek] = useState<string>("latest");

  // ===== load all analytical data when a unit is selected =====
  useEffect(() => {
    if (!selectedId) {
      setOverall(null);
      setWeekly(null);
      setAssessment(null);
      return;
    }

    (async () => {
      // overall
      const o = await overallEngagement(authorizedFetch, selectedId, "weekly");
      // FIX #4: coerce to numbers for Chart.js
      const coercedOverall = {
        ...o,
        user: o.user.map(Number),
        class: o.class.map(Number),
        pre_semester: o.pre_semester.map(Number),
      };
      setOverall(coercedOverall);

      // FIX #3: match old jQuery semantics (peers were hidden when show_peer === true)
      setShowPeer(!o.show_peer);

      // weekly (initial = latest)
      const w = await weeklyEngagement(authorizedFetch, selectedId, "latest");
      const coercedWeekly = {
        ...w,
        user: w.user.map(Number),
        class: w.class.map(Number),
        pre_semester: w.pre_semester.map(Number),
      };
      setWeekly(coercedWeekly);
      setSelectedWeek(String(w.selected_week));

      // assessment
      const ap = await assessmentPerformance(authorizedFetch, selectedId);
      setAssessment(ap);
    })().catch(console.error);
  }, [authorizedFetch, selectedId]);

  // ===== re-load weekly when week changes =====
  useEffect(() => {
    if (!selectedId) return;
    (async () => {
      const w = await weeklyEngagement(authorizedFetch, selectedId, selectedWeek);
      const coercedWeekly = {
        ...w,
        user: w.user.map(Number),
        class: w.class.map(Number),
        pre_semester: w.pre_semester.map(Number),
      };
      setWeekly(coercedWeekly);
    })().catch(() => {});
  }, [authorizedFetch, selectedId, selectedWeek]);


  return (
    <>
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
                  onClick={() => selectUnit(unit)}
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

      <h4 className="text-sm leading-none font-medium">Learning Progress Insights</h4>
      <Separator className="my-4" />
      <Card>
        <CardHeader>
          <CardTitle>Your overall time engagement in this unit (measured by minutes)</CardTitle>
        </CardHeader>
        <CardContent>
         {/* FIX #2: give the chart a height so canvas isn’t 0px */}
          <div className="h-80">
            {overall ? (
              <OverallLine
                labels={overall.label}
                dUser={overall.user}
                lUser="Your time engagement"
                dPeers={overall.class}
                lPeers="Average time engagement of your peers this semester"
                dPrev={overall.pre_semester}
                lPrev="Average time engagement of HD & D students in the previous semester"
                showPeer={showPeer}
                telemetry={{
                onLegendClick: ({ datasetIndex, text, visible }) => {
                  console.log("legend click", { datasetIndex, text, visible });
                  // send to your API if desired
                },
                onHover: ({ datasetIndex, index, label }) => {
                   console.log("hover", { datasetIndex, index, label });
                },
                onDataClick: ({ datasetIndex, index, label }) => {
                   console.log("click", { datasetIndex, index, label });
                },
              }}
              />
            ) : (
              <p className="text-sm text-muted-foreground">Select a unit to load the chart…</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your time engagement with course materials from a specific week (measured by minutes)</CardTitle>
        </CardHeader>
        <CardContent>
       <div className="h-80">
            {weekly ? (
              <WeeklyBar
                labels={weekly.label}
                dUser={weekly.user}
                lUser="Your time engagement"
                dPeers={weekly.class}
                lPeers="Average time engagement of your peers this semester"
                dPrev={weekly.pre_semester}
                lPrev="Average time engagement of HD & D students in the previous semester"
                showPeer={showPeer}
              />
            ) : (
              <p className="text-sm text-muted-foreground">Select a unit to load the chart…</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="justify-center">
           <Select
            value={selectedWeek}
            onValueChange={(v) => setSelectedWeek(v)}
            disabled={!weekly}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select week" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {(weekly?.weeks ?? []).map((w) => (
                  <SelectItem key={String(w)} value={String(w)}>
                    Week {String(w)}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </CardFooter>
      </Card>

      {/* Assessment performance (boxplot)
      <Card>
        <CardHeader>
          <CardTitle>Assessment performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            {assessment ? (
              <AssessmentBoxplot
                labels={assessment.label}
                dUser={assessment.user}
                lUser="Your assessment performance"
                dPeers={assessment.class}
                lPeers="Overall class performance this semester"
                dPrev={assessment.pre_semester}
                lPrev="Overall class performance from the previous semester"
                showPeer={showPeer}
              />
            ) : (
              <p className="text-sm text-muted-foreground">Select a unit to load the chart…</p>
            )}
          </div>
        </CardContent>
      </Card> */}

      <h4
        className="text-sm leading-none font-medium"
      >
        How You Can Learn Better?
      </h4>
      <Separator className="my-4" />
      <Card>
        <CardHeader>
          <CardTitle>How you should improve?</CardTitle>
        </CardHeader>
        <CardContent>
          <FeedbackPanel feedbackSet={data} />
        </CardContent>
      </Card>
    </>
  );
}
