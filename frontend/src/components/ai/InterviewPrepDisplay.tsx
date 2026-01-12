import { motion } from "framer-motion";
import { Brain, CheckCircle2, MessageSquare, Target } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface InterviewPrepData {
  tips?: string[];
  questions?: string[];
  keyPoints?: string[];
  summary?: string;
  [key: string]: any; // Allow for flexible structure
}

interface InterviewPrepDisplayProps {
  data: InterviewPrepData;
}

const InterviewPrepDisplay = ({ data }: InterviewPrepDisplayProps) => {
  // Handle different possible structures from AI
  const tips = data.tips || data.interviewTips || data.prepTips || [];
  const questions = data.questions || data.possibleQuestions || data.sampleQuestions || [];
  const keyPoints = data.keyPoints || data.importantPoints || data.highlights || [];
  const summary = data.summary || data.overview || "";

  return (
    <div className="space-y-6">
      {/* Summary */}
      {summary && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <Brain className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-foreground mb-2">Interview Overview</h3>
                <p className="text-foreground leading-relaxed">{summary}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Points */}
      {keyPoints.length > 0 && (
        <Card className="border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="font-semibold text-foreground">Key Points to Remember</h3>
            </div>
            <ul className="space-y-3">
              {keyPoints.map((point: string, index: number) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">{point}</span>
                </motion.li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Tips */}
      {tips.length > 0 && (
        <Card className="border-green-200 dark:border-green-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="w-5 h-5 text-green-600 dark:text-green-400" />
              <h3 className="font-semibold text-foreground">Preparation Tips</h3>
            </div>
            <ul className="space-y-3">
              {tips.map((tip: string, index: number) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">{tip}</span>
                </motion.li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Questions */}
      {questions.length > 0 && (
        <Card className="border-purple-200 dark:border-purple-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <h3 className="font-semibold text-foreground">Possible Interview Questions</h3>
            </div>
            <ul className="space-y-3">
              {questions.map((question: string, index: number) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <MessageSquare className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">{question}</span>
                </motion.li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default InterviewPrepDisplay;

