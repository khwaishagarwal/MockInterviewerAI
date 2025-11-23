"use client";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { Loader, Loader2Icon } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import QuestionListContainer from "./QuestionListContainer";
import { supabase } from "@/services/supabaseClient";
import { useUser } from "@/app/provider";

function QuestionList({ formData, onCreateLink }) {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [questionList, setQuestionList] = useState([]);

  useEffect(() => {
    if (formData && formData.jobPosition && formData.jobDescription && formData.duration && formData.type?.length > 0) {
      GenerateQuestionList();
    }
  }, [formData]);

  const GenerateQuestionList = async () => {
    setLoading(true);
    try {
      const result = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/ai-model`,
        {
          ...formData,
          type: Array.isArray(formData.type) ? formData.type.join(", ") : formData.type,
        },
        {
          headers: { "Content-Type": "application/json" },
      });

      console.log("✅ Backend response:", result.data);

      if (!result.data || result.data.error) {
        toast.error(result.data?.error || "No response from server.");
        setLoading(false);
        return;
      }

      const parsed = result.data;

      if (!parsed.interviewQuestions || !Array.isArray(parsed.interviewQuestions)) {
        toast.error("No valid interview questions returned.");
        setLoading(false);
        return;
      }

      setQuestionList(parsed.interviewQuestions);
    } catch (error) {
      console.error("❌ Axios/Network error:", error.response?.data || error.message);
      toast.error("Unable to connect to backend. Please check your environment or CORS.");
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async () => {
    setSaveLoading(true);
    const interview_id = uuidv4();

    try {
      const { error: insertError } = await supabase
        .from("Interviews")
        .insert([
          {
            ...formData,
            questionList,
            userEmail: user?.email,
            interview_id,
          },
        ]);

      if (insertError) throw insertError;

      await supabase
        .from("Users")
        .update({ credits: Number(user?.credits) - 1 })
        .eq("email", user?.email);

      onCreateLink(interview_id);
    } catch (err) {
      console.error("❌ Error saving interview:", err);
      toast.error("Failed to save interview.");
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div>
      {loading && (
        <div className="p-5 bg-blue-50 rounded-xl border border-primary flex gap-5 items-center">
          <Loader2Icon className="animate-spin" />
          <div>
            <h2 className="font-medium">Generating Interview Questions</h2>
            <p className="text-primary">
              Our AI is crafting personalized questions based on your job position...
            </p>
          </div>
        </div>
      )}

      {!loading && questionList?.length > 0 && (
        <QuestionListContainer questionList={questionList} />
      )}

      {questionList?.length > 0 && (
        <div className="flex justify-end mt-10">
          <Button onClick={onFinish} disabled={saveLoading}>
            {saveLoading && <Loader className="animate-spin mr-2" />}
            Create Interview Link & Finish
          </Button>
        </div>
      )}
    </div>
  );
}

export default QuestionList;