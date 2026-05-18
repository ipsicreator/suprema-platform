"use client";

import UserInfoForm, { UserInfo } from "../../components/UserInfoForm";

interface Step1Props {
  onNext: (info: UserInfo) => void;
}

export default function Step1({ onNext }: Step1Props) {
  return <UserInfoForm onNext={onNext} serviceType="diagnosis" />;
}
