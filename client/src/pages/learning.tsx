import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { GraduationCap, BarChart3, Bot, Shield, Brain, Search, Play, Clock, Star } from "lucide-react";
import Header from "@/components/Header";
import type { LearningContent } from "@/types/trading";

export default function Learning() {
  const { data: learningContent, isLoading } = useQuery<LearningContent[]>({
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
      case "shield":
        return <Shield className="h-6 w-6 text-secondary" />;
      case "brain":
        return <Brain className="h-6 w-6 text-pink-400" />;
      default:
        return <GraduationCap className="h-6 w-6 text-primary" />;
    }
  };

  const getBadgeStyle = (category: string) => {
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

  const myProgress = [
    { courseId: 1, progress: 75, completed: 9, total: 12 },
    { courseId: 2, progress: 45, completed: 8, total: 18 },
    { courseId: 3, progress: 20, completed: 2, total: 8 }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Learning Center</h1>
            <p className="text-muted-foreground mt-1">Master forex trading with AI-powered education</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input 
                placeholder="Search courses..." 
                className="pl-10 w-64"
              />
            </div>
          </div>
        </div>

        {/* My Progress */}
        <Card className="trading-card mb-8">
          <CardHeader>
            <CardTitle>My Learning Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {myProgress.map((progress) => (
                <div key={progress.courseId} className="bg-background/50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-medium">Course {progress.courseId}</span>
                    <span className="text-sm text-muted-foreground">
                      {progress.completed}/{progress.total}
                    </span>
                  </div>
                  <Progress value={progress.progress} className="mb-2" />
                  <p className="text-sm text-muted-foreground">{progress.progress}% complete</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Course Categories */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="trading-card cursor-pointer hover:scale-105 transition-transform">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-secondary/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="font-semibold mb-2">Beginner</h3>
              <p className="text-sm text-muted-foreground mb-4">Start your trading journey</p>
              <Badge className="bg-secondary/20 text-secondary">5 Courses</Badge>
            </CardContent>
          </Card>

          <Card className="trading-card cursor-pointer hover:scale-105 transition-transform">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-orange-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-8 w-8 text-orange-400" />
              </div>
              <h3 className="font-semibold mb-2">Intermediate</h3>
              <p className="text-sm text-muted-foreground mb-4">Advanced techniques</p>
              <Badge className="bg-orange-500/20 text-orange-400">8 Courses</Badge>
            </CardContent>
          </Card>

          <Card className="trading-card cursor-pointer hover:scale-105 transition-transform">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Bot className="h-8 w-8 text-purple-400" />
              </div>
              <h3 className="font-semibold mb-2">Advanced</h3>
              <p className="text-sm text-muted-foreground mb-4">Expert AI strategies</p>
              <Badge className="bg-purple-500/20 text-purple-400">3 Courses</Badge>
            </CardContent>
          </Card>
        </div>

        {/* All Courses */}
        <Card className="trading-card">
          <CardHeader>
            <CardTitle>All Courses</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading courses...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {learningContent?.map((course) => (
                  <div key={course.id} className="bg-background/50 rounded-lg p-6 hover:bg-background/70 transition-colors cursor-pointer">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                        {getIconComponent(course.icon)}
                      </div>
                      <Badge className={getBadgeStyle(course.category)}>
                        {course.category.charAt(0).toUpperCase() + course.category.slice(1)}
                      </Badge>
                    </div>
                    
                    <h3 className="font-semibold mb-2">{course.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{course.description}</p>
                    
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                      <div className="flex items-center space-x-1">
                        <Play className="h-4 w-4" />
                        <span>{course.lessons} lessons</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{course.estimatedMinutes}m</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="text-sm">4.8</span>
                      </div>
                      <Button size="sm" className="btn-primary">
                        Start Course
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Tutor */}
        <Card className="trading-card mt-8">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                <Bot className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>AI Trading Tutor</CardTitle>
                <p className="text-sm text-muted-foreground">Get personalized help 24/7</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-background/50 rounded-lg p-4 mb-4">
              <p className="text-sm mb-2"><strong>AI:</strong> Ready to help you learn! What would you like to know about forex trading?</p>
            </div>
            <div className="flex space-x-2">
              <Input placeholder="Ask me anything about trading..." className="flex-1" />
              <Button className="btn-primary">Ask AI</Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              <Button variant="outline" size="sm">What is forex?</Button>
              <Button variant="outline" size="sm">Explain RSI indicator</Button>
              <Button variant="outline" size="sm">Risk management tips</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}