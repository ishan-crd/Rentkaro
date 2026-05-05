import { Badge } from "@/components/ui/badge";
import { ThumbsUp, Minus, ThumbsDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function SentimentBadge({ score, className, showLabel = false }: { score: number, className?: string, showLabel?: boolean }) {
  if (score > 0.6) {
    return (
      <Badge variant="outline" className={cn("text-xs font-medium flex items-center gap-1 bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800", className)}>
        <ThumbsUp className="w-3 h-3" />
        {showLabel ? "Positive Reviews" : `${Math.round(score * 100)}%`}
      </Badge>
    );
  }
  if (score >= 0.4) {
    return (
      <Badge variant="outline" className={cn("text-xs font-medium flex items-center gap-1 bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/30 dark:text-yellow-400 dark:border-yellow-800", className)}>
        <Minus className="w-3 h-3" />
        {showLabel ? "Mixed Reviews" : `${Math.round(score * 100)}%`}
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className={cn("text-xs font-medium flex items-center gap-1 bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800", className)}>
      <ThumbsDown className="w-3 h-3" />
      {showLabel ? "Negative Reviews" : `${Math.round(score * 100)}%`}
    </Badge>
  );
}

export function SentimentBar({ score }: { score: number }) {
  const percentage = Math.round(score * 100);
  let colorClass = "bg-red-500";
  if (score > 0.6) colorClass = "bg-green-500";
  else if (score >= 0.4) colorClass = "bg-yellow-500";

  return (
    <div className="flex flex-col gap-1 w-full">
      <div className="flex justify-between text-xs font-medium">
        <span>Review Sentiment</span>
        <span className={colorClass.replace('bg-', 'text-')}>{percentage}% Positive</span>
      </div>
      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
        <div 
          className={`h-full ${colorClass} transition-all duration-500`} 
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
