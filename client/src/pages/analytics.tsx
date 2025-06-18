import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAnalytics } from "@/lib/api";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer 
} from "recharts";
import { 
  Users, 
  GraduationCap, 
  Award, 
  Building,
  TrendingUp,
  FileText
} from "lucide-react";

const COLORS = ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

export default function Analytics() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ["/api/analytics"],
    queryFn: () => getAnalytics(),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <Sidebar />
        <div className="ml-64 min-h-screen">
          <header className="bg-white shadow-sm border-b border-gray-200 h-16 flex items-center px-6">
            <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          </header>
          <main className="p-6">
            <div className="space-y-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="h-64 bg-gray-100 rounded animate-pulse" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </main>
        </div>
      </div>
    );
  }

  const experienceData = analytics?.experienceDistribution ? 
    Object.entries(analytics.experienceDistribution).map(([key, value]) => ({
      name: key,
      value: value as number
    })) : [];

  const universityTypeData = analytics?.universityTypeDistribution ?
    Object.entries(analytics.universityTypeDistribution).map(([key, value]) => ({
      name: key,
      value: value as number
    })) : [];

  const similarityData = analytics?.similarityDistribution ?
    Object.entries(analytics.similarityDistribution).map(([key, value]) => ({
      score: parseFloat(key),
      count: value as number
    })).sort((a, b) => a.score - b.score) : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Sidebar />
      
      <div className="ml-64 min-h-screen">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 h-16 flex items-center justify-between px-6">
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          
          <div className="flex items-center space-x-2 bg-green-50 px-3 py-1 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-green-700 font-medium">System Online</span>
          </div>
        </header>

        <main className="p-6 space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="hover-scale">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Resumes</p>
                    <p className="text-3xl font-bold text-gray-900">{analytics?.totalResumes || 0}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <FileText className="text-blue-600" size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="hover-scale">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Fresh Graduates</p>
                    <p className="text-3xl font-bold text-gray-900">{analytics?.totalFreshGrads || 0}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <GraduationCap className="text-green-600" size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="hover-scale">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Avg Similarity</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {analytics?.averageSimilarity?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <TrendingUp className="text-purple-600" size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="hover-scale">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Universities</p>
                    <p className="text-3xl font-bold text-gray-900">{analytics?.uniqueUniversities || 0}</p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <Building className="text-orange-600" size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Candidates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="mr-2" size={20} />
                Top 2 Candidates
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analytics?.topCandidates?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {analytics.topCandidates.map((candidate: any, index: number) => (
                    <div key={index} className="p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg border">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
                          <span className="text-white font-bold">
                            {candidate.name?.split(' ').map((n: string) => n[0]).join('') || 'N'}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{candidate.name || 'Unknown'}</h3>
                          <p className="text-sm text-gray-600">{candidate.university || 'Unknown University'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary">{candidate.similarity?.toFixed(2) || '0.00'}</p>
                          <p className="text-xs text-gray-500">Similarity Score</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No candidates available</p>
              )}
            </CardContent>
          </Card>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Experience Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Experience Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                {experienceData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={experienceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#6366f1" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    No data available
                  </div>
                )}
              </CardContent>
            </Card>

            {/* University Type Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>University Type Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                {universityTypeData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={universityTypeData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {universityTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    No data available
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Similarity Score Histogram */}
            <Card>
              <CardHeader>
                <CardTitle>Similarity Score Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                {similarityData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={similarityData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="score" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#8b5cf6" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    No data available
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="mr-2" size={20} />
                  Quick Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="font-medium text-blue-900">Total Processed</span>
                    <span className="text-2xl font-bold text-blue-600">{analytics?.totalResumes || 0}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="font-medium text-green-900">Fresh Graduates</span>
                    <span className="text-2xl font-bold text-green-600">{analytics?.totalFreshGrads || 0}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                    <span className="font-medium text-purple-900">Unique Universities</span>
                    <span className="text-2xl font-bold text-purple-600">{analytics?.uniqueUniversities || 0}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                    <span className="font-medium text-orange-900">Average Score</span>
                    <span className="text-2xl font-bold text-orange-600">
                      {analytics?.averageSimilarity?.toFixed(1) || '0.0'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
