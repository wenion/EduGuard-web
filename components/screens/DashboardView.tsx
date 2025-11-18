"use client";

import { use, useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { FeedbackSet } from "@/types/Feedback";
import { ActionPlanItem, ActionPlanResponse } from "@/types/ActionPlan";
import type {
  OverallEngagementResponse,
  WeeklyEngagementResponse,
  AssessmentPerformanceResponse,
} from "@/types/Chart";
import { fetchUserProfile, fetchUserFeedback, fetchActionPlanRequest } from "@/lib/authApi";
import { FeedbackPanel } from "@/components/screens/FeedbackPanel";
import { PlannerPanel } from "@/components/screens/PlannerPanel";
import { ProgressPanel } from "@/components/screens/ProgressPanel";
import { CornerDownLeft } from 'lucide-react';


// import { OverallLine, __PING__ } from "./LineChart";
// console.log("__PING__", __PING__);

import { overallEngagement, weeklyEngagement, assessmentPerformance } from "@/lib/userApi";
import { OverallLine } from "./LineChart";
import { WeeklyBar } from "@/components/screens/WeeklyBarChart";
import { AssessmentBoxplot } from "@/components/screens/BoxplotChart";


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
  const {
    user,
    isAuthenticated,
    authorizedFetch,
    selectedUnitId,
    setUnitId
  } = useAuth();
  const units = useMemo<Unit[]>(
    () => (user?.enrolled_units as Unit[] | undefined) ?? [],
    [user]
  );

  useEffect(() => {
    fetchUserProfile(authorizedFetch);
  }, [authorizedFetch])

  const registerUnitSelect = (u: Unit) => {
    setUnitId(u.unit_id);
    onUnitSelect?.(u);
    loadAnalyticalData(u.unit_id);
  };

  const backAll = () => {
    setUnitId(null);
    onUnitSelect?.(null);
    onBackAllUnits?.();
  };

  const [data, setData] = useState<FeedbackSet>({ feedback_set: [] });
  const [plannerData, setPlannerData] = useState<ActionPlanResponse>({ action_plan: [] });

  const loadPrescriptiveData = () => {
    loadFeedback();
    loadActionPlan();
  }

  const loadFeedback = async () => {
    try {
      if (!selectedUnitId) {
        console.error("No unit selected.");
        return;
      }
      const res = await fetchUserFeedback(authorizedFetch, selectedUnitId);
      const feedbackArr: FeedbackSet = res;
      setData(feedbackArr);
    } catch (e: any) {
      console.error("Failed to load feedback data:", e);
    }
  };

  const loadActionPlan = async () => {
    try {
      if (!selectedUnitId) {
        console.error("No unit selected.");
        return;
      }
      const res = await fetchActionPlanRequest(authorizedFetch, selectedUnitId);
      setPlannerData(res);
    } catch (e: any) {
      console.error("Failed to load action plan data:", e);
    }
  };

  const loadAnalyticalData = (unit: number) => {
    loadEngagement(unit);
    loadWeeklyEngagement(unit);
    loadAssessment(unit);
  };

  const loadEngagement = async(unit: number, mode = "weekly") => {
    try {
      const o = await overallEngagement(authorizedFetch, unit, mode);
      const coercedOverall = {
        ...o,
        user: o.user.map(Number),
        class: o.class.map(Number),
        pre_semester: o.pre_semester.map(Number),
      };
      setOverall(coercedOverall);
    } catch (e: any) {
      console.error("loadEngagement", unit, mode, "error!")
    }
  };
  const loadWeeklyEngagement = async (unit: number, week: string =  "latest") => {
    try {
      const w = await weeklyEngagement(authorizedFetch, unit, week);
      const coercedWeekly = {
        ...w,
        user: w.user.map(Number),
        class: w.class.map(Number),
        pre_semester: w.pre_semester.map(Number),
      };
      setWeekly(coercedWeekly);
      setSelectedWeek(w.selected_week.toString());
    } catch (e: any) {
      console.error("loadWeeklyEngagement", unit, "error!")
    }
  };
  const loadAssessment = async (unit: number) => {
    try {
      const ap = await assessmentPerformance(authorizedFetch, unit);
      setAssessment(ap);
    } catch (e: any) {
      console.error("loadAssessment", unit, "error!")
    }
  };

  if (!isAuthenticated) {
    return <p className="text-muted">Please sign in to view your units.</p>;
  }

// ===== chart state =====
  const [overall, setOverall] = useState<null | OverallEngagementResponse>(null);
  const [weekly, setWeekly] = useState<null | WeeklyEngagementResponse>(null);
  const [assessment, setAssessment] = useState<null | AssessmentPerformanceResponse>(null);

  const [selectedWeek, setSelectedWeek] = useState<string>();

  const onChangeSeletor = (week: string) => {
    if (!selectedUnitId) {
      console.error("No unit selected.");
      return;
    }
    loadWeeklyEngagement(selectedUnitId, week);
    setSelectedWeek(week);
  }

  const handleTelemetry = {
    onLegendClick: (e: { datasetIndex: number; text: string; visible: boolean }) => {
      console.log("Legend click:", e);
    },
    onHover: (e: { datasetIndex: number; index: number; label: string }) => {
      console.log("Hover:", e);
    },
    onDataClick: (e: { datasetIndex: number; index: number; label: string }) => {
      console.log("Click:", e);
    },
  };

  // ===== load all analytical data when a unit is selected =====
  // useEffect(() => {
  //   if (!selectedUnitId) {
  //     setOverall(null);
  //     setWeekly(null);
  //     setAssessment(null);
  //     return;
  //   }

  //   (async () => {
  //     // overall
  //     // const o = await overallEngagement(authorizedFetch, selectedUnitId, "weekly");
  //     // FIX #4: coerce to numbers for Chart.js
  //     // const coercedOverall = {
  //     //   ...o,
  //     //   user: o.user.map(Number),
  //     //   class: o.class.map(Number),
  //     //   pre_semester: o.pre_semester.map(Number),
  //     // };
  //     // setOverall(coercedOverall);

  //     // // FIX #3: match old jQuery semantics (peers were hidden when show_peer === true)
  //     // setShowPeer(o.show_peer);

  //     // // weekly (initial = latest)
  //     // const w = await weeklyEngagement(authorizedFetch, selectedUnitId, "latest");
  //     // const coercedWeekly = {
  //     //   ...w,
  //     //   user: w.user.map(Number),
  //     //   class: w.class.map(Number),
  //     //   pre_semester: w.pre_semester.map(Number),
  //     // };
  //     // setWeekly(coercedWeekly);
  //     // setSelectedWeek(String(w.selected_week));

  //     // assessment
  //     const ap = await assessmentPerformance(authorizedFetch, selectedUnitId);
  //     setAssessment(ap);
  //   })().catch(console.error);
  // }, [authorizedFetch, selectedUnitId]);

  // // ===== re-load weekly when week changes =====
  // useEffect(() => {
  //   if (!selectedUnitId) return;
  //   (async () => {
  //     const w = await weeklyEngagement(authorizedFetch, selectedUnitId, selectedWeek);
  //     const coercedWeekly = {
  //       ...w,
  //       user: w.user.map(Number),
  //       class: w.class.map(Number),
  //       pre_semester: w.pre_semester.map(Number),
  //     };
  //     setWeekly(coercedWeekly);
  //   })().catch(() => {});
  // }, [authorizedFetch, selectedUnitId, selectedWeek]);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Unit Selection</CardTitle>
          <CardDescription>
            Choose a unit to load personalised insights and actions.
          </CardDescription>
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
                  className="cursor-pointer unit-select"
                  key={unit.unit_id}
                  data-unit-id={unit.unit_id}
                  data-state={selectedUnitId === unit.unit_id && "selected"}
                  onClick={()=> {registerUnitSelect(unit)}}
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
          <CardAction onClick={backAll}>
            <Button className="cursor-pointer">Back to all units <CornerDownLeft /></Button>
          </CardAction>
        </CardFooter>
      </Card>

      {selectedUnitId && user && (
        <>
          <Tabs defaultValue="insight" className="w-full pt-4">
            <TabsList className="flex m-auto">
              <TabsTrigger value="insight">Learning Progress Insights</TabsTrigger>
              <TabsTrigger
                value="planner"
                onClick={loadPrescriptiveData}
              >
                How You Can Learn Better?
              </TabsTrigger>
            </TabsList>
            <TabsContent value="insight">
              <div className="flex flex-col gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Your overall time engagement in this unit (measured by minutes)</CardTitle>
                </CardHeader>
                <CardContent>
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
                    showPeer={!user.compareWithPeer}
                    telemetry={handleTelemetry}
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
                      showPeer={!user.compareWithPeer}
                      telemetry={handleTelemetry}
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">Select a unit to load the chart…</p>
                  )}
                  </div>
                </CardContent>
                <CardFooter className="justify-center">
                  <Select value={selectedWeek} onValueChange={onChangeSeletor}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Select week" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {(weekly?.weeks ?? []).map((w, index) => (
                          <SelectItem key={index} value={w.toString()}>
                            Week {w}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </CardFooter>
              </Card>

               <Card>
        <CardHeader>
          <CardTitle>Assessment performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            {assessment ? (
              <AssessmentBoxplot
                labels={assessment.label}
                dUser={assessment.user}              // line data (your performance)
                lUser="Your assessment performance"
                dPeers={assessment.class}              // peers (boxplot)
                lPeers="Overall class performance this semester"
                dPrev={assessment.pre_semester}       // previous semester (boxplot)
                lPrev="Overall class performance from the previous semester"
                showPeer={!user.compareWithPeer}
                telemetry={handleTelemetry}
              />
            ) : (
              <p className="text-sm text-muted-foreground">Select a unit to load the chart…</p>
            )}
          </div>
        </CardContent>
      </Card>
              </div>
            </TabsContent>

            <TabsContent value="planner">
              <div className="flex">
                <FeedbackPanel feedbackSet={data} />
                <PlannerPanel onAddPlanner={loadActionPlan} />
                <ProgressPanel plannerData ={plannerData} />
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </>
  );
}