import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { ResultsTable } from "@/components/results/results-table";
import { getResults } from "@/lib/api";
import { Bell } from "lucide-react";

export default function Results() {
  const { data: results = [], isLoading } = useQuery({
    queryKey: ["/api/results"],
    queryFn: () => getResults(),
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Sidebar />
      
      <div className="ml-64 min-h-screen">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 h-16 flex items-center justify-between px-6">
          <h1 className="text-2xl font-bold text-gray-900">Results</h1>
          
          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors duration-200">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                3
              </span>
            </button>
            
            <div className="flex items-center space-x-2 bg-green-50 px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-700 font-medium">System Online</span>
            </div>
          </div>
        </header>

        <main className="p-6">
          <ResultsTable results={results} isLoading={isLoading} />
        </main>
      </div>
    </div>
  );
}
