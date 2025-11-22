import { Button } from "@/components/ui/button";
import moment from "moment";
import React from "react";
import CandidateFeedbackDialog from "./CandidateFeedbackDialog";

function CandidateList({ candidate }) {
  if (!candidate || candidate.length === 0) {
    return (
      <div className="text-gray-500 font-medium mt-5">No candidate feedback available.</div>
    );
  }

  return (
    <div>
      <h2 className="font-bold my-5">Candidates ({candidate.length})</h2>

      {candidate.map((cand, ind) => {
        const userName = cand?.userName || "Unknown";
        const feedback = cand?.feedback;
        const ratings = feedback?.rating;

        const total =
          (ratings?.technicalSkills || 0) +
          (ratings?.communication || 0) +
          (ratings?.problemSolving || 0) +
          (ratings?.experience || 0);

        const averageRating = (total / 4).toFixed(1);

        return (
          <div
            key={ind}
            className="p-5 flex justify-between gap-3 items-center bg-white rounded-lg"
          >
            <div className="flex items-center gap-5">
              <h2 className="bg-primary p-2 px-4.5 font-bold text-white text-sm rounded-full">
                {userName[0]?.toUpperCase()}
              </h2>
              <div>
                <h2>{userName.toUpperCase()}</h2>
                <h2 className="text-sm text-gray-500">
                  Completed On: {moment(cand?.created_at).format("DD MMM, YYYY")}
                </h2>
              </div>
            </div>

            <div className="flex gap-2 items-center">
              {/* Uncomment below line to show rating */}
              {/* <h2 className="text-sm text-green-600">{averageRating}/10</h2> */}
              <CandidateFeedbackDialog candidate={cand} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default CandidateList;
