import { useEffect, useState } from "react";
import { toast } from "sonner";
import "./App.css";
import { Button } from "./components/ui/button";
import DesignSystemDemo from "./components/DesignSystemDemo";

function App() {
  const [count, setCount] = useState(0);
  const [showDemo, setShowDemo] = useState(true);

  useEffect(() => {
    toast("Count updated!");
  }, [count]);

  if (showDemo) {
    return <DesignSystemDemo />;
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-heading font-semibold">ATS UI Application</h1>
          <Button 
            onClick={() => setShowDemo(true)}
            className="bg-purple text-white hover:opacity-90"
          >
            View Design System
          </Button>
        </div>
        
        <div className="bg-deep-gray p-6 rounded-lg border border-medium-gray">
          <h2 className="text-body font-medium mb-4">Sample Content</h2>
          <Button 
            onClick={() => setCount((count) => count + 1)}
            className="bg-purple text-white hover:opacity-90 mr-4"
          >
            count is {count}
          </Button>
          <Button 
            onClick={() => setShowDemo(false)}
            variant="outline"
            className="border-medium-gray text-secondary hover:text-white"
          >
            Hide Demo
          </Button>
        </div>
      </div>
    </div>
  );
}

export default App;
