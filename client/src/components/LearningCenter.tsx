import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, BarChart3, Bot, ArrowRight } from "lucide-react";
import type { LearningContent } from "@/types/trading";

export default function LearningCenter() {
  const { data: learningContent } = useQuery<LearningContent[]>({
    queryKey: ["/api/learning"],
  });

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case "graduation-cap":
        return <GraduationCap className="h-6 w-6 text-primary" />;
      case "chart-bar":
        return <BarChart3 className="h-6 w-6 text-orange-400" />;
      case "robot":
        return <Bot className="h-6 w-6 text-purple-400" />;
      default:
        return <GraduationCap className="h-6 w-6 text-primary" />;
    }
  };

  const getBadgeVariant = (category: string) => {
    switch (category) {
      case "beginner":
        return "bg-secondary/20 text-secondary";
      case "intermediate":
        return "bg-orange-500/20 text-orange-400";
      case "advanced":
        return "bg-purple-500/20 text-purple-400";
      default:
        return "bg-secondary/20 text-secondary";
    }
  };

  return (
    <div className="mb-8">
      <Card className="trading-card">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Learning Center</CardTitle>
            <Button variant="link" className="text-primary hover:text-primary/80">
              View All Courses <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {learningContent && learningContent.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {learningContent.map((course) => (
                <div 
                  key={course.id}
                  className="bg-background/50 rounded-lg p-4 hover:bg-background/70 transition-colors cursor-pointer"
                >
                  <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                    {getIconComponent(course.icon)}
                  </div>
                  <h3 className="font-semibold mb-2">{course.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{course.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{course.lessons} lessons</span>
                    <Badge className={getBadgeVariant(course.category)}>
                      {course.category.charAt(0).toUpperCase() + course.category.slice(1)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-background/50 rounded-lg p-4 hover:bg-background/70 transition-colors cursor-pointer">
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                  <GraduationCap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Forex Fundamentals</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Learn the basics of forex trading, currency pairs, and market analysis.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">12 lessons</span>
                  <Badge className="bg-secondary/20 text-secondary">Beginner</Badge>
                </div>
              </div>
              
              <div className="bg-background/50 rounded-lg p-4 hover:bg-background/70 transition-colors cursor-pointer">
                <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-orange-400" />
                </div>
                <h3 className="font-semibold mb-2">Technical Analysis</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Master technical indicators, chart patterns, and trading strategies.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">18 lessons</span>
                  <Badge className="bg-orange-500/20 text-orange-400">Intermediate</Badge>
                </div>
              </div>
              
              <div className="bg-background/50 rounded-lg p-4 hover:bg-background/70 transition-colors cursor-pointer">
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Bot className="h-6 w-6 text-purple-400" />
                </div>
                <h3 className="font-semibold mb-2">AI Trading Strategies</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Understand how AI analyzes markets and generates trading signals.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">8 lessons</span>
                  <Badge className="bg-purple-500/20 text-purple-400">Advanced</Badge>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
