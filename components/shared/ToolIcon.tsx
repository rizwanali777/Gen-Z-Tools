import {
  ArrowLeftRight,
  AudioLines,
  Binary,
  Braces,
  Cake,
  Calculator,
  CaseSensitive,
  Eraser,
  FileJson,
  Files,
  FileText,
  Image,
  Italic,
  Mail,
  PenLine,
  Percent,
  QrCode,
  Scaling,
  Sparkles,
  SpellCheck,
  Table,
  Type,
  type LucideIcon,
} from "lucide-react";
import type { IconName } from "@/config/tools-registry";

const iconMap: Record<IconName, LucideIcon> = {
  FileText,
  Files,
  Table,
  Type,
  CaseSensitive,
  SpellCheck,
  Eraser,
  Scaling,
  AudioLines,
  Braces,
  Binary,
  FileJson,
  Cake,
  ArrowLeftRight,
  QrCode,
  Image,
  Italic,
  Calculator,
  Mail,
  Sparkles,
  PenLine,
  Percent,
};

export function ToolIcon({ name, className }: { name: IconName; className?: string }) {
  const Icon = iconMap[name];
  return <Icon className={className} aria-hidden />;
}
