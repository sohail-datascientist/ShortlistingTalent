import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sidebar } from "@/components/layout/sidebar";
import { getResults, getAnalytics } from "@/lib/api";
import { FileText, CheckCircle, Star, Clock, Users, TrendingUp, Award } from "lucide-react";

export default function Dashboard() {
  const { data: results = [], isLoading: resultsLoading } = useQuery({
    queryKey: ["/api/results"],
    queryFn: () => getResults(),
  });

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ["/api/analytics"],
    queryFn: () => getAnalytics(),
  });

  const stats = [
    {
      title: "Total Processed",
      value: analytics?.totalResumes || 0,
      icon: FileText,
      change: "+12%",
      changeType: "positive" as const,
      description: "vs last month"
    },
    {
      title: "Success Rate",
      value: `${((analytics?.totalResumes - 0) / Math.max(analytics?.totalResumes || 1, 1) * 100).toFixed(1)}%`,
      icon: CheckCircle,
      change: "+2.1%",
      changeType: "positive" as const,
      description: "improvement"
    },
    {
      title: "Avg. Score",
      value: analytics?.averageSimilarity?.toFixed(2) || "0.00",
      icon: Star,
      change: "",
      changeType: "neutral" as const,
      description: "Similarity score"
    },
    {
      title: "Fresh Graduates",
      value: analytics?.totalFreshGrads || 0,
      icon: Users,
      change: "",
      changeType: "neutral" as const,
      description: "In queue"
    },
  ];

  const recentResults = results.slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Sidebar />
      
      <div className="ml-64 min-h-screen">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 h-16 flex items-center justify-between px-6">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-green-50 px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-700 font-medium">System Online</span>
            </div>
          </div>
        </header>

        <main className="p-6 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="hover-scale">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                        <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                      </div>
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <Icon className="text-blue-600" size={24} />
                      </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm">
                      {stat.change && (
                        <span className={`font-medium ${
                          stat.changeType === 'positive' ? 'text-green-600' : 'text-gray-500'
                        }`}>
                          {stat.change}
                        </span>
                      )}
                      <span className={`${stat.change ? 'ml-1' : ''} text-gray-500`}>
                        {stat.description}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="mr-2" size={20} />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {resultsLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
                    ))}
                  </div>
                ) : recentResults.length > 0 ? (
                  <div className="space-y-3">
                    {recentResults.map((result) => (
                      <div key={result.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-xs">
                            {result.fullName?.split(' ').map(n => n[0]).join('') || 'N'}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{result.fullName || 'Unknown'}</p>
                          <p className="text-sm text-gray-500">
                            Similarity: {result.similarity?.toFixed(2) || '0.00'}
                          </p>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          (result.similarity || 0) >= 0.8 
                            ? 'bg-green-100 text-green-800'
                            : (result.similarity || 0) >= 0.6
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {(result.similarity || 0) >= 0.8 ? 'Strong' : (result.similarity || 0) >= 0.6 ? 'Good' : 'Weak'}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No recent activity</p>
                )}
              </CardContent>
            </Card>

            {/* Top Candidates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="mr-2" size={20} />
                  Top Candidates
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analyticsLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
                    ))}
                  </div>
                ) : analytics?.topCandidates?.length > 0 ? (
                  <div className="space-y-3">
                    {analytics.topCandidates.map((candidate: any, index: number) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-xs">
                            {candidate.name?.split(' ').map((n: string) => n[0]).join('') || 'N'}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{candidate.name || 'Unknown'}</p>
                          <p className="text-sm text-gray-500">{candidate.university || 'Unknown University'}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">{candidate.similarity?.toFixed(2) || '0.00'}</p>
                          <p className="text-xs text-gray-500">Score</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No candidates yet</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="mr-2" size={20} />
                Quick Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{analytics?.uniqueUniversities || 0}</p>
                  <p className="text-sm text-blue-800">Universities</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{analytics?.totalFreshGrads || 0}</p>
                  <p className="text-sm text-green-800">Fresh Grads</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">
                    {Object.keys(analytics?.experienceDistribution || {}).length}
                  </p>
                  <p className="text-sm text-purple-800">Experience Levels</p>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <p className="text-2xl font-bold text-orange-600">{analytics?.averageSimilarity?.toFixed(1) || '0.0'}</p>
                  <p className="text-sm text-orange-800">Avg Similarity</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
