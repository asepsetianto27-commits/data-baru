import * as React from "react";
import type { LeaveStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { CheckCircleIcon, HourglassIcon, XCircleIcon } from "@/components/ui/icons";
import { STATUS_LABEL } from "@/lib/utils";
import { cn } from "@/lib/utils";

const TONE: Record<LeaveStatus, string> = {
  PENDING: "border-amber-200 bg-amber-50 text-amber-800",
  APPROVED: "border-emerald-200 bg-emerald-50 text-emerald-800",
  REJECTED: "border-rose-200 bg-rose-50 text-rose-800",
};

function StatusIcon({ status }: { status: LeaveStatus }) {
  if (status === "APPROVED") return <CheckCircleIcon size={12} />;
  if (status === "REJECTED") return <XCircleIcon size={12} />;
  return <HourglassIcon size={12} />;
}

export function StatusBadge({
  status,
  className,
}: {
  status: LeaveStatus;
  className?: string;
}) {
  return (
    <Badge className={cn(TONE[status], className)}>
      <StatusIcon status={status} />
      {STATUS_LABEL[status]}
    </Badge>
  );
}
