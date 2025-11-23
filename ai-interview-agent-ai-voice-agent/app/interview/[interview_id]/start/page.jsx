"use client";

import { InterviewDataContext } from "@/context/InterviewDataContext";
import { Mic, Phone, Timer, Loader2Icon } from "lucide-react";
import Image from "next/image";
import React, { useContext, useEffect, useRef, useState } from "react";
import Vapi from "@vapi-ai/web";
import AlertConfirmation from "./_components/AlertConfirmation";
import { toast } from "sonner";
import TimerComponent from "./_components/TimerComponent";
import axios from "axios";
import { supabase } from "@/services/supabaseClient";
import { useParams, useRouter } from "next/navigation";

function StartInterview() {
  const { interviewInfo } = useContext(InterviewDataContext);
  const { interview_id } = useParams();
  const router = useRouter();

  const vapi = useRef(null);
  const conversationRef = useRef([]);

  const [activeUser, setActiveUser] = useState(false);
  const [hasInterviewStarted, setHasInterviewStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [startTimer, setStartTimer] = useState(false);
  const [resetTimer, setResetTimer] = useState(false);

  /** ---------------------------
   *  STOP INTERVIEW MANUALLY
   * -------------------------- */
  const stopInterview = () => {
    if (vapi.current) {
      console.log("Stopping Vapi call...");
      vapi.current.stop();
      setActiveUser(false);
      setStartTimer(false);
      setResetTimer(true);
      toast("Interview stopped.");
    }
  };

  /** ---------------------------
   *  START INTERVIEW CALL
   * -------------------------- */
  const startCall = () => {
    let questionList = "";

    interviewInfo?.interviewData?.questionList?.forEach((item) => {
      questionList += item?.question + ",";
    });

    const assistantOptions = {
      name: "Recroot.AI",
      firstMessage: `Hi ${interviewInfo?.userName}! Let's begin your interview for the role of ${interviewInfo?.interviewData?.jobPosition}.`,
      transcriber: { provider: "deepgram", model: "nova-2", language: "en-US" },
      voice: { provider: "playht", voiceId: "jennifer" },
      model: {
        provider: "openai",
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `
You are an AI interviewer.
Ask one question at a time from: ${questionList}.
Wait for user response.
Give short feedback.
End with summary & recommendation.
`.trim(),
          },
        ],
      },
    };

    console.log("Starting Vapi call...");
    vapi.current.start(assistantOptions);
  };

  /** ---------------------------
   *  GENERATE FEEDBACK
   * -------------------------- */
  const GenerateFeedback = async () => {
    console.log("GenerateFeedback triggered");

    if (!conversationRef.current.length) {
      console.log("Conversation empty!");
      toast("Conversation empty");
      return;
    }

    setLoading(true);

    try {
      // 1) Call backend for feedback
      const result = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/ai-feedback`,
        { conversation: conversationRef.current }
      );

      console.log("AI FEEDBACK RESPONSE:", result.data);

      const feedback = result.data?.feedback;

      if (!feedback) {
        toast("AI returned invalid feedback.");
        return;
      }

      // Prepare payload
      const insertPayload = {
        interview_id: String(interview_id),
        userEmail: interviewInfo?.userEmail ?? null,
        feedback: feedback, // entire object is stored
        recommended: feedback?.recommendation === "Hire" || feedback?.feedback?.recommendation === "Hire",
      };

      console.log("Payload for interview-feedback:", insertPayload);

      // 2) Insert into Supabase
      const { data, error } = await supabase
        .from("interview_feedback")
        .insert([insertPayload])
        .select();

      console.log("Insert result:", { data, error });

      if (error) {
        console.error("❌ SUPABASE FEEDBACK INSERT ERROR:", error);
        toast("Failed to insert feedback");
        return;
      }

      toast("Feedback saved!");
      router.replace(`/interview/${interview_id}/completed`);
    } catch (err) {
      console.error("Error generating feedback:", err);
      toast("Unable to generate feedback");
    } finally {
      setLoading(false);
    }
  };

  /** --------------------------------------------
   *  INITIALIZE VAPI + ATTACH EVENT LISTENERS
   * ------------------------------------------- */
  useEffect(() => {
    if (!interviewInfo || hasInterviewStarted) return;

    vapi.current = new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY);
    console.log("VAPI initialized:", vapi.current);

    const handleCallStart = () => {
      console.log("CALL STARTED");
      setActiveUser(true);
    };

    const handleSpeechStart = () => {
      console.log("User Speaking...");
      setStartTimer(true);
      setResetTimer(false);
    };

    const handleSpeechEnd = () => {
      console.log("User Speech Ended");
      setStartTimer(false);
    };

    const handleCallEnd = () => {
      console.log("CALL ENDED. Generating feedback...");
      setActiveUser(false);
      GenerateFeedback();
    };

    const handleMessage = (msg) => {
      console.log("VAPI MESSAGE", msg);
      if (msg?.conversation) conversationRef.current = msg.conversation;
    };

    // Attach listeners
    vapi.current.on("call-start", handleCallStart);
    vapi.current.on("speech-start", handleSpeechStart);
    vapi.current.on("speech-end", handleSpeechEnd);
    vapi.current.on("call-end", handleCallEnd);
    vapi.current.on("message", handleMessage);

    startCall();
    setHasInterviewStarted(true);

    return () => {
      console.log("Cleaning up Vapi listeners...");
      vapi.current?.off("call-start", handleCallStart);
      vapi.current?.off("speech-start", handleSpeechStart);
      vapi.current?.off("speech-end", handleSpeechEnd);
      vapi.current?.off("call-end", handleCallEnd);
      vapi.current?.off("message", handleMessage);
    };
  }, []);

  return (
    <div className="p-20 lg:px-48 xl:px-56">
      <h2 className="font-bold text-xl flex justify-between">
        AI Interview Session
        <span className="flex gap-2 items-center">
          <Timer />
          <TimerComponent startTimer={startTimer} resetTimer={resetTimer} />
        </span>
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-7 mt-4">
        <div className="bg-white h-[400px] rounded-lg border flex flex-col gap-3 items-center justify-center shadow-2xl relative">
          {!activeUser && (
            <span className="absolute inset-0 rounded-full bg-blue-100 opacity-80 animate-pulse"></span>
          )}
          <Image
            src="/ai-model.jpg"
            alt="AI-Image"
            width={120}
            height={120}
            className="object-cover rounded-full"
          />
          <h2 className="font-semibold">Recroot.AI</h2>
        </div>

        <div className="bg-white h-[400px] rounded-lg border flex flex-col gap-3 items-center justify-center shadow-2xl">
          <div className="relative">
            {activeUser && (
              <span className="absolute inset-0 rounded-full bg-blue-500 opacity-75 animate-pulse"></span>
            )}
            <h2 className="text-2xl bg-primary text-white p-3 rounded-full px-5">
              {interviewInfo?.userName[0]}
            </h2>
          </div>
          <h2>{interviewInfo?.userName}</h2>
        </div>
      </div>

      <div className="flex items-center gap-5 justify-center mt-5">
        <Mic className="h-12 w-12 p-3 bg-gray-500 text-white rounded-full cursor-pointer hover:bg-gray-800 hover:scale-110 transition-all shadow-2xl" />

        <AlertConfirmation stopInterview={stopInterview}>
          {!loading ? (
            <Phone
              className="h-12 w-12 p-3 bg-red-500 text-white rounded-full cursor-pointer hover:bg-red-900 hover:scale-110 transition-all shadow-2xl"
              onClick={stopInterview}
            />
          ) : (
            <Loader2Icon className="animate-spin" />
          )}
        </AlertConfirmation>
      </div>

      <h2 className="text-sm text-gray-400 text-center mt-5">
        Interview in Progress...
      </h2>
    </div>
  );
}

export default StartInterview;