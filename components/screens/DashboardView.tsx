"use client";

import { useEffect, useMemo, useRef, useState } from "react";

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
import { ChatbotPanel } from "@/components/screens/ChatbotPanel";
import { CornerDownLeft } from 'lucide-react';


// import { OverallLine, __PING__ } from "./LineChart";
// console.log("__PING__", __PING__);

import { overallEngagement, weeklyEngagement, assessmentPerformance } from "@/lib/userApi";
import { OverallLine } from "./LineChart";
import { WeeklyBar } from "@/components/screens/WeeklyBarChart";
import { AssessmentBoxplot } from "@/components/screens/BoxplotChart";
import { useSwitchTracking } from "@/context/useSwitchTracking";

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
    setUnitId,
    setSelectedUnitName,
    setSelectedUnitCode,
    selectedWeek,
    setSelectedWeek,
  } = useAuth();
  const units = useMemo<Unit[]>(
    () => (user?.enrolled_units as Unit[] | undefined) ?? [],
    [user]
  );

  const { logSelectTrace } = useSwitchTracking();
  useEffect(() => {
    fetchUserProfile(authorizedFetch);
  }, [authorizedFetch])

  const registerUnitSelect = (u: Unit) => {
    setUnitId(u.unit_id);
    setSelectedUnitName(u.unit_name);
    setSelectedUnitCode(u.unit_code);
    onUnitSelect?.(u);
    loadAnalyticalData(u.unit_id);
    logSelectTrace({
      type: "select",
      text: `${u.unit_code} - ${u.unit_name}`,
      tag: "tr",
      id: null,
      className: "unit-select",
      unit_id: selectedUnitId,
      unit_code: u.unit_code,
      unit_name: u.unit_name,
      selected_week: null,
      selection_type: 'unit'
    });
  };

  const onLoadAnalyticalData = () => {
    if (!selectedUnitId) {
      console.error("No unit selected.");
      return;
    }
    loadAnalyticalData(selectedUnitId);
  };

  const backAll = () => {
    setUnitId(null);
    setSelectedUnitName(null);
    setSelectedUnitCode(null);
    setSelectedWeek(null);
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

  const onAddPlanner = () => {
    setTimeout(loadActionPlan, 1000);
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

  const onChangeSeletor = (week: string) => {
    if (!selectedUnitId) {
      console.error("No unit selected.");
      return;
    }
    loadWeeklyEngagement(selectedUnitId, week);
    setSelectedWeek(week);
    logSelectTrace({
      type: "select",
      text: `Week ${week}`,
      tag: "select",
      id: "week-selector",
      className: "select-weekly-engagement",
      selection_type: "week"
    });
  }

  const handleTelemetry = {
    onLegendClick: (e: { datasetIndex: number; text: string; visible: boolean }) => {
      // console.log("Legend click:", e);
    },
    onHover: (e: { datasetIndex: number; index: number; label: string }) => {
      // console.log("Hover:", e);
    },
    onDataClick: (e: { datasetIndex: number; index: number; label: string }) => {
      // console.log("Click:", e);
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
      <Card id="contentPanel" attr-class="hide" role="region" aria-live="polite">
        <CardHeader>
          <CardTitle id="unitSelectionHeading">Unit Selection</CardTitle>
          <CardDescription attr-class="section-subtitle">
            Choose a unit to load personalised insights and actions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <caption className="sr-only">Available units with learning insights</caption>
            <TableHeader attr-class="table-light">
              <TableRow>
                <TableHead>Unit Code</TableHead>
                <TableHead>Unit Name</TableHead>
                <TableHead>Semester</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody id="unitList">
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
        {selectedUnitId && (
          <CardFooter className="justify-end">
            <CardAction onClick={backAll}>
              <Button className="cursor-pointer" id="all-unit-btn">Back to all units <CornerDownLeft /></Button>
            </CardAction>
          </CardFooter>
        )}
      </Card>

      {selectedUnitId && user && (
        <>
          <Tabs defaultValue="insight" className="w-full pt-4">
            <TabsList className="flex m-auto w-full" id="insight-select-container" role="tablist" aria-label="Insight families">
              <TabsTrigger value="insight" asChild>
                <Button
                  variant="ghost"
                  id="engagement-tab-nav"
                  className="cursor-pointer hover:bg-transparent"
                  onClick={onLoadAnalyticalData}
                >
                  Learning Progress Insights
                </Button>
              </TabsTrigger>
              <TabsTrigger value="planner" asChild>
                <Button
                  variant="ghost"
                  id="performance-tab-nav"
                  className="cursor-pointer hover:bg-transparent"
                  aria-controls="prescriptive-insights"
                  onClick={loadPrescriptiveData}
                >
                  How You Can Learn Better?
                </Button>
              </TabsTrigger>
            </TabsList>
            <TabsContent value="insight" id="progress">
              <div className="flex flex-col lg:flex-row gap-6 pb-28" id="analytical-insights">
                <Card className="lg:w-1/3" aria-labelledby="overallEngagementHeading">
                  <CardHeader>
                    <CardTitle>
                      <h2 id="overallEngagementHeading">Your overall time engagement in this unit (measured by minutes)</h2>
                    </CardTitle>
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

                <Card className="lg:w-1/3" aria-labelledby="weeklyEngagementHeading">
                  <CardHeader>
                    <CardTitle>
                      <h2 id="weeklyEngagementHeading">Your time engagement with course materials from a specific week (measured by minutes)</h2>
                    </CardTitle>
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
                    <Select value={selectedWeek === null ? undefined : selectedWeek} onValueChange={onChangeSeletor}>
                      <SelectTrigger
                        id="week-selector"
                        aria-label="Select a teaching week"
                        attr-class="select-weekly-engagement"
                        className="w-[200px]"
                      >
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

                {assessment && (
                  <Card className="lg:w-1/3" aria-labelledby="assessmentHeading">
                    <CardHeader>
                      <CardTitle>
                        <h2 id="assessmentHeading">Assessment Mark Distributions</h2>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
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
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="planner" id="feedback">
              <div className="flex flex-col lg:flex-row gap-6 xl:pb-28 lg:h-[80rem] xl:h-[72rem] 2xl:h-[66rem]" id="prescriptive-insights">
                <FeedbackPanel feedbackSet={data} className="lg:w-1/3 h-full" />
                <PlannerPanel onAddPlanner={onAddPlanner} className="lg:w-1/3 h-full" />
                <ProgressPanel plannerData ={plannerData} className="lg:w-1/3 h-full" />
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}

      {selectedUnitId && (<ChatbotPanel />)}
    </>
  );
}