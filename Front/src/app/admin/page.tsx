"use client";

import { RoleGate } from "@/src/components/auth/role-gate";
import { PosTerminal } from "@/src/components/pos/pos-terminal";

export default function AdminPage() {
  return (
    <RoleGate allow={["Admin"]}>
      <PosTerminal mode="admin" />
    </RoleGate>
  );
}
