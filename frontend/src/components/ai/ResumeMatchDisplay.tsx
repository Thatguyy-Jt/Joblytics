import { motion } from "framer-motion";
import { CheckCircle2, AlertCircle, Lightbulb, TrendingUp, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface ResumeMatchData {
  matchScore?: number;
  strengths?: string[];
  gaps?: string[];
  suggestions?: string[];
  summary?: string;
  analyzedAt?: string;
}

interface ResumeMatchDisplayProps {
  data: ResumeMatchData;
}

const ResumeMatchDisplay = ({ data }: ResumeMatchDisplayProps) => {
  const matchScore = data.matchScore || 0;
  const strengths = data.strengths || [];
  const gaps = data.gaps || [];
  const suggestions = data.suggestions || [];
  const summary = data.summary || "";

  // Determine match score color
  const getScoreColor = (score: number) => {
    if (score >= 80) return "from-green-500 to-emerald-500";
    if (score >= 60) return "from-blue-500 to-cyan-500";
    if (score >= 40) return "from-amber-500 to-orange-500";
    return "from-red-500 to-pink-500";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent Match";
    if (score >= 60) return "Good Match";
    if (score >= 40) return "Fair Match";
    return "Needs Improvement";
  };

  return (
    <div className="space-y-6">
      {/* Match Score Card */}
      <Card className="border-2">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getScoreColor(matchScore)} flex items-center justify-center`}>
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Resume Match Score</h3>
                <p className="text-sm text-muted-foreground">{getScoreLabel(matchScore)}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-foreground">{matchScore}%</div>
              <div className="text-xs text-muted-foreground">Match</div>
            </div>
          </div>
          <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${matchScore}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`h-full bg-gradient-to-r ${getScoreColor(matchScore)}`}
            />
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      {summary && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-foreground mb-2">Analysis Summary</h3>
                <p className="text-foreground leading-relaxed">{summary}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Strengths */}
      {strengths.length > 0 && (
        <Card className="border-green-200 dark:border-green-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
              <h3 className="font-semibold text-foreground">Your Strengths</h3>
            </div>
            <ul className="space-y-3">
              {strengths.map((strength, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">{strength}</span>
                </motion.li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Gaps */}
      {gaps.length > 0 && (
        <Card className="border-amber-200 dark:border-amber-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <h3 className="font-semibold text-foreground">Areas to Improve</h3>
            </div>
            <ul className="space-y-3">
              {gaps.map((gap, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">{gap}</span>
                </motion.li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <Card className="border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="font-semibold text-foreground">Actionable Suggestions</h3>
            </div>
            <ul className="space-y-3">
              {suggestions.map((suggestion, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <Lightbulb className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">{suggestion}</span>
                </motion.li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ResumeMatchDisplay;

