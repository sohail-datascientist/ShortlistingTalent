import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Download, Search, Filter } from "lucide-react";
import type { Result } from "@shared/schema";

interface ResultsTableProps {
  results: Result[];
  isLoading?: boolean;
}

export function ResultsTable({ results, isLoading }: ResultsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"similarity" | "name" | "university">("similarity");

  const filteredResults = results
    .filter((result) =>
      result.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.university?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "similarity":
          return (b.similarity || 0) - (a.similarity || 0);
        case "name":
          return (a.fullName || "").localeCompare(b.fullName || "");
        case "university":
          return (a.university || "").localeCompare(b.university || "");
        default:
          return 0;
      }
    });

  const getMatchBadge = (similarity: number | null) => {
    if (!similarity) return <Badge variant="secondary">Unknown</Badge>;
    
    if (similarity >= 0.8) {
      return <Badge className="bg-green-100 text-green-800">Strong Match</Badge>;
    } else if (similarity >= 0.6) {
      return <Badge className="bg-yellow-100 text-yellow-800">Good Match</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-800">Weak Match</Badge>;
    }
  };

  const exportToCsv = () => {
    const headers = ["Name", "Email", "University", "Experience", "Similarity", "Location"];
    const csvData = [
      headers.join(","),
      ...filteredResults.map(result => [
        result.fullName || "",
        result.email || "",
        result.university || "",
        result.experience || "",
        result.similarity || 0,
        result.location || ""
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvData], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "resume-results.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Results...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Filter className="mr-2" size={20} />
            Screening Results ({filteredResults.length})
          </CardTitle>
          <Button onClick={exportToCsv} className="flex items-center space-x-2">
            <Download size={16} />
            <span>Export CSV</span>
          </Button>
        </div>
        
        {/* Search and Filter Controls */}
        <div className="flex items-center space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <Input
              placeholder="Search candidates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="similarity">Sort by Similarity</option>
            <option value="name">Sort by Name</option>
            <option value="university">Sort by University</option>
          </select>
        </div>
      </CardHeader>
      
      <CardContent>
        {filteredResults.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No results found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Candidate</TableHead>
                  <TableHead>University</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead>Similarity</TableHead>
                  <TableHead>Match Quality</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResults.map((result) => (
                  <TableRow key={result.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {result.fullName?.split(' ').map(n => n[0]).join('') || 'N/A'}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{result.fullName || 'N/A'}</p>
                          <p className="text-sm text-gray-500">{result.email || 'N/A'}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <span className="text-sm text-gray-900">{result.university || 'N/A'}</span>
                        <span className={`block text-xs ${result.universityType === 'International' ? 'text-blue-600' : 'text-green-600'}`}>
                          {result.universityType || 'Unknown'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-900">
                      {result.experience || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Progress 
                          value={(result.similarity || 0) * 100} 
                          className="w-16 h-2"
                        />
                        <span className="text-sm font-medium text-gray-900">
                          {result.similarity?.toFixed(2) || '0.00'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getMatchBadge(result.similarity)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
