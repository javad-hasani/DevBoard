import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const Card = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => <div className={cn("rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow)]", className)} {...props} />;
export const CardHeader = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => <div className={cn("flex items-start justify-between gap-4 p-5 pb-2", className)} {...props} />;
export const CardContent = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => <div className={cn("p-5", className)} {...props} />;
