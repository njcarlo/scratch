"use client";

import { StethoscopeIcon } from "@/components/icons";
import { ComingSoon } from "@/components/layout/ComingSoon";

export default function HealthcarePage() {
  return (
    <ComingSoon
      icon={StethoscopeIcon}
      titleKey="stub.healthcare.title"
      bodyKey="stub.healthcare.body"
    />
  );
}
