import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";

function CandidateFeedbackDialog({ candidate }) {
  const feedback = candidate?.feedback?.feedback || candidate?.feedback || {};

  const rating = feedback?.rating || {};

  const name = candidate?.userName || candidate?.userEmail || "Unknown User";

  const initial = name?.[0]?.toUpperCase() || "U";

  const total =
    (rating?.technicalSkills || 0) +
    (rating?.communication || 0) +
    (rating?.problemSolving || 0) +
    (rating?.experience || 0);

  const average = (total / 4).toFixed(1);

  const isRejected =
    feedback?.recommendation?.toLowerCase()?.includes("not") ||
    feedback?.recommendation === "No";

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="text-primary">
          View Report
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Feedback Report</DialogTitle>

          <DialogDescription asChild>
            <div className="mt-5">
              {/* TOP SECTION */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-5">
                  <h2 className="bg-primary p-3 px-4 font-bold text-white text-sm rounded-full">
                    {initial}
                  </h2>

                  <div>
                    <h2 className="font-semibold">{name.toUpperCase()}</h2>
                    <h2 className="text-sm text-gray-500">
                      {candidate?.userEmail || "No Email"}
                    </h2>
                  </div>
                </div>

                <div className="text-primary text-2xl font-bold">
                  {average}/10
                </div>
              </div>

              {/* SKILL RATINGS */}
              <div className="mt-5">
                <h2 className="font-bold">Skills Assessment</h2>

                <div className="mt-3 grid grid-cols-2 gap-10">
                  {[
                    ["Technical Skills", rating?.technicalSkills],
                    ["Communication", rating?.communication],
                    ["Problem Solving", rating?.problemSolving],
                    ["Experience", rating?.experience],
                  ].map(([label, value], idx) => (
                    <div key={idx}>
                      <h2 className="flex justify-between">
                        {label}
                        <span>{value || 0}/10</span>
                      </h2>

                      <Progress value={(value || 0) * 10} className="mt-1" />
                    </div>
                  ))}
                </div>
              </div>

              {/* SUMMARY */}
              <div className="mt-5">
                <h2 className="font-bold">Performance Summary</h2>
                <div className="p-5 bg-secondary my-3 rounded-md">
                  <p>{feedback?.summary || "No summary provided."}</p>
                </div>
              </div>

              {/* RECOMMENDATION */}
              <div
                className={`p-5 mt-8 rounded-md flex justify-between items-center ${
                  isRejected ? "bg-red-300" : "bg-green-300"
                }`}
              >
                <div>
                  <h2
                    className={`font-bold ${
                      isRejected ? "text-red-700" : "text-green-700"
                    }`}
                  >
                    Recommendation:
                  </h2>

                  <p
                    className={`select-none ${
                      isRejected ? "text-red-600" : "text-green-700"
                    }`}
                  >
                    {feedback?.recommendationMsg ||
                      "No recommendation message provided."}
                  </p>
                </div>

                <div className="flex flex-col items-center">
                  <Link href={"https://mail.google.com/"} target="_blank">
                    <Button
                      className={`p-5 rounded-md ${
                        isRejected ? "bg-red-700" : "bg-green-700"
                      } text-white`}
                    >
                      Send Email
                    </Button>
                  </Link>

                  <p className="text-sm text-zinc-500 mt-2">
                    mail - {candidate?.userEmail}
                  </p>
                </div>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

export default CandidateFeedbackDialog;