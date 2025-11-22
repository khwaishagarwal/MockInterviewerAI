"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { useUser } from "@/app/provider";
import { supabase } from "@/services/supabaseClient";
import React from "react";

function PayButton({ amount, credits }) {
  const { user } = useUser();

  const handleRazorpay = async () => {
    try {
      const res = await fetch("/api/razorpay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });

      const data = await res.json();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency,
        name: "Recroot AI",
        description: "Interview Credits Purchase",
        order_id: data.id,
        handler: async function (response) {
          const { data: updated, error } = await supabase
            .from("Users")
            .update({ credits: (user?.credits || 0) + credits })
            .eq("email", user?.email);

          if (error) {
            toast.error("Failed to update credits!");
          } else {
            toast.success("Credits added successfully!");
            window.location.reload();
          }
        },
        prefill: {
          name: user?.user_metadata?.name || "User",
          email: user?.email,
        },
        theme: {
          color: "#3399cc",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      toast.error("Payment initialization failed");
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-full bg-blue-600 text-white py-2 rounded-md font-medium hover:bg-blue-700 cursor-pointer">
          Purchase Credits
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Proceed to Pay</DialogTitle>
          <DialogDescription asChild>
            <div className="flex justify-center">
              <Button
                onClick={handleRazorpay}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Pay ₹{amount}
              </Button>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

export default PayButton;
