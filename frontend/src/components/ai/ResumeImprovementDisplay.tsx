import { motion } from "framer-motion";
import { FileText, Sparkles, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface ResumeImprovementData {
  improvedBullets?: string[];
  improvements?: string[];
  keywords?: string[];
  summary?: string;
  [key: string]: any;
}

interface ResumeImprovementDisplayProps {
  data: ResumeImprovementData;
}

const ResumeImprovementDisplay = ({ data }: ResumeImprovementDisplayProps) => {
  const improvedBullets = data.improvedBullets || data.bullets || [];
  const improvements = data.improvements || data.suggestions || [];
  const keywords = data.keywords || [];
  const summary = data.summary || "";

  return (
    <div className="space-y-6">
      {/* Summary */}
      {summary && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-foreground mb-2">Improvement Summary</h3>
                <p className="text-foreground leading-relaxed">{summary}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Improved Bullets */}
      {improvedBullets.length > 0 && (
        <Card className="border-green-200 dark:border-green-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
              <h3 className="font-semibold text-foreground">Improved Resume Bullets</h3>
            </div>
            <ul className="space-y-3">
              {improvedBullets.map((bullet: string, index: number) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">{bullet}</span>
                </motion.li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Improvements */}
      {improvements.length > 0 && (
        <Card className="border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="font-semibold text-foreground">Improvement Suggestions</h3>
            </div>
            <ul className="space-y-3">
              {improvements.map((improvement: string, index: number) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">{improvement}</span>
                </motion.li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Keywords */}
      {keywords.length > 0 && (
        <Card className="border-purple-200 dark:border-purple-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <h3 className="font-semibold text-foreground">Important Keywords to Include</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {keywords.map((keyword: string, index: number) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium"
                >
                  {keyword}
                </motion.span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ResumeImprovementDisplay;

