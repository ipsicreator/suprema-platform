"use client";

import { motion } from "framer-motion";

interface StepProgressProps {
  steps: string[];
  currentStep: number;
}

export default function StepProgress({ steps, currentStep }: StepProgressProps) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "60px", position: "relative" }}>
      {/* Background Line */}
      <div style={{ position: "absolute", top: "24px", left: "40px", right: "40px", height: "2px", background: "var(--border-light)", zIndex: 0 }} />
      
      {/* Active Line */}
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        style={{ position: "absolute", top: "24px", left: "40px", width: "100%", height: "2px", background: "var(--suprima-burgundy)", zIndex: 1, transformOrigin: "left" }}
      />

      {steps.map((step, idx) => {
        const stepNo = idx + 1;
        const isActive = stepNo <= currentStep;
        const isCurrent = stepNo === currentStep;

        return (
          <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", zIndex: 2, flex: 1 }}>
            <motion.div 
              animate={{ 
                background: isActive ? "var(--suprima-burgundy)" : "white",
                color: isActive ? "white" : "var(--text-light)",
                scale: isCurrent ? 1.1 : 1,
                borderColor: isActive ? "var(--suprima-burgundy)" : "var(--border-light)"
              }}
              style={{ 
                width: "48px", 
                height: "48px", 
                borderRadius: "50%", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center", 
                fontWeight: 800,
                fontSize: "14px",
                border: "2px solid",
                fontFamily: "Outfit, sans-serif"
              }}
            >
              {stepNo}
            </motion.div>
            <span style={{ 
              fontSize: "13px", 
              fontWeight: isCurrent ? 800 : 600, 
              color: isCurrent ? "var(--suprima-burgundy)" : "var(--text-light)",
              letterSpacing: "-0.02em"
            }}>
              {step}
            </span>
          </div>
        );
      })}
    </div>
  );
}
