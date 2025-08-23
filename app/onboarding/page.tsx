"use client"
import { useState } from "react"
import { FinanceAgent } from "@/components/finance-agent"

export default function OnboardingPage() {

    const [step, setStep] = useState(1);

    let page = <h1>Step {step}</h1>;

    switch (step) {
        case 1:
            page = <h1>Step 1</h1>;
            break;
        case 2:
            page = <h1>Step 2</h1>;
            break;
        case 3:
            page = <h1>Step 3</h1>;
            break;
        default:
            page = <h1>Step 1</h1>;
            break;
    }

  return (
    <div className="min-h-screen bg-background">
      {page}
    </div>
  )
}
