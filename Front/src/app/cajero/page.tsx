"use client";

import { RoleGate } from "@/src/components/auth/role-gate";
import { PosTerminal } from "@/src/components/pos/pos-terminal";

export default function CajeroPage() {
  return (
    <RoleGate allow={["Cajero", "Admin"]}>
      <PosTerminal mode="cajero" />
    </RoleGate>
  );
}
