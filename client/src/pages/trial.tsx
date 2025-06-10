import Header from "@/components/Header";
import TrialSystem from "@/components/TrialSystem";

export default function Trial() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">7-Day Authenticity Trial</h1>
          <p className="text-muted-foreground mt-1">
            Prove to yourself our signals are real with trackable performance data
          </p>
        </div>

        <TrialSystem />
      </div>
    </div>
  );
}