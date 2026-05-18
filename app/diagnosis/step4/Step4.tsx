"use client";

import ReportComponent from "../report";

interface Step4Props {
  evaluated: any[];
  userInfo: any;
  onReset: () => void;
}

export default function Step4({ evaluated, userInfo, onReset }: Step4Props) {
  return (
    <ReportComponent 
      results={evaluated} 
      studentInfo={userInfo} 
      onReset={onReset} 
    />
  );
}
