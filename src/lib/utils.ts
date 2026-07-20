import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export const compactNumber = (value: number, locale = "en") =>
  new Intl.NumberFormat(locale, { notation: "compact", maximumFractionDigits: 1 }).format(value);
