import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { FileUpload } from "@/components/upload/file-upload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { uploadFiles, processResumes } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { 
  Briefcase, 
  Users, 
  Settings, 
  Play, 
  CheckCircle, 
  Clock, 
  LoaderPinwheel,
  FileText,
  Brain
} from "lucide-react";

export default function Upload() {
  const [jobDescriptionFiles, setJobDescriptionFiles] = useState<File[]>([]);
  const [resumeFiles, setResumeFiles] = useState<File[]>([]);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [similarityThreshold, setSimilarityThreshold] = useState(0.6);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: ({ jobDescription, resumes }: { jobDescription: File; resumes: File[] }) =>
      uploadFiles(jobDescription, resumes),
    onSuccess: (data) => {
      setUploadResult(data);
      toast({
        title: "Upload successful",
        description: `Uploaded job description and ${data.totalResumes} resumes`,
      });
    },
    onError: (error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const processMutation = useMutation({
    mutationFn: ({ jobDescriptionId, resumeIds }: { jobDescriptionId: number; resumeIds: number[] }) =>
      processResumes(jobDescriptionId, resumeIds),
    onSuccess: (data) => {
      setIsProcessing(false);
      setProcessingProgress(100);
      toast({
        title: "Processing completed",
        description: `Successfully processed ${data.processedCount} resumes`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/results"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics"] });
    },
    onError: (error) => {
      setIsProcessing(false);
      setProcessingProgress(0);
      toast({
        title: "Processing failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleUpload = () => {
    if (jobDescriptionFiles.length === 0) {
      toast({
        title: "Job description required",
        description: "Please upload a job description file",
        variant: "destructive",
      });
      return;
    }

    if (resumeFiles.length === 0) {
      toast({
        title: "Resumes required",
        description: "Please upload at least one resume file",
        variant: "destructive",
      });
      return;
    }

    uploadMutation.mutate({
      jobDescription: jobDescriptionFiles[0],
      resumes: resumeFiles,
    });
  };

  const handleProcess = () => {
    if (!uploadResult) {
      toast({
        title: "Upload files first",
        description: "Please upload files before processing",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setProcessingProgress(0);

    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setProcessingProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 1000);

    processMutation.mutate({
      jobDescriptionId: uploadResult.jobDescriptionId,
      resumeIds: uploadResult.resumeIds,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Sidebar />
      
      <div className="ml-64 min-h-screen">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 h-16 flex items-center justify-between px-6">
          <h1 className="text-2xl font-bold text-gray-900">Upload & Process</h1>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-green-50 px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-700 font-medium">Groq API Connected</span>
            </div>
          </div>
        </header>

        <main className="p-6 space-y-6">
          {/* Upload Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="hover-scale">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">JD Uploaded</p>
                    <p className="text-3xl font-bold text-gray-900">{jobDescriptionFiles.length}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Briefcase className="text-blue-600" size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="hover-scale">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Resumes Ready</p>
                    <p className="text-3xl font-bold text-gray-900">{resumeFiles.length}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <FileText className="text-green-600" size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="hover-scale">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Processing</p>
                    <p className="text-3xl font-bold text-gray-900">{isProcessing ? "Active" : "Idle"}</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Brain className="text-purple-600" size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="hover-scale">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {uploadResult ? "Ready" : "Waiting"}
                    </p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <Clock className="text-yellow-600" size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Job Description Upload */}
          <FileUpload
            accept=".pdf,.txt"
            multiple={false}
            onFilesChange={setJobDescriptionFiles}
            title="Job Description Upload"
            description="Upload the job description to match against resumes"
            icon={<Briefcase className="mr-3" size={20} />}
            files={jobDescriptionFiles}
          />

          {/* Resume Upload */}
          <FileUpload
            accept=".pdf,.txt"
            multiple={true}
            onFilesChange={setResumeFiles}
            title="Resume Upload"
            description="Upload multiple resumes to screen against the job description"
            icon={<Users className="mr-3" size={20} />}
            files={resumeFiles}
          />

          {/* Processing Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="mr-3" size={20} />
                Processing Controls
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Processing Model
                  </label>
                  <select className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent">
                    <option>llama-3.3-70b-versatile</option>
                  </select>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Similarity Threshold
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={similarityThreshold}
                    onChange={(e) => setSimilarityThreshold(parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0.0</span>
                    <span className="font-medium">{similarityThreshold.toFixed(2)}</span>
                    <span>1.0</span>
                  </div>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Auto-Export Results
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="autoExport"
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label htmlFor="autoExport" className="text-sm text-gray-700">
                      Enable CSV Export
                    </label>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex justify-center space-x-4">
                <Button
                  onClick={handleUpload}
                  disabled={uploadMutation.isPending || isProcessing}
                  variant="outline"
                  size="lg"
                >
                  {uploadMutation.isPending ? (
                    <>
                      <LoaderPinwheel className="mr-2 animate-spin" size={20} />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <FileText className="mr-2" size={20} />
                      Upload Files
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={handleProcess}
                  disabled={!uploadResult || isProcessing || processMutation.isPending}
                  size="lg"
                  className="bg-gradient-to-r from-primary to-secondary hover:shadow-xl"
                >
                  {isProcessing || processMutation.isPending ? (
                    <>
                      <LoaderPinwheel className="mr-2 animate-spin" size={20} />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Play className="mr-2" size={20} />
                      Start Processing
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Processing Progress */}
          {(isProcessing || processingProgress > 0) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  {isProcessing ? (
                    <LoaderPinwheel className="mr-3 animate-spin" size={20} />
                  ) : (
                    <CheckCircle className="mr-3 text-green-600" size={20} />
                  )}
                  {isProcessing ? "Processing in Progress" : "Processing Complete"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Overall Progress</span>
                    <span className="font-medium text-gray-900">
                      {processingProgress}% completed
                    </span>
                  </div>
                  <Progress value={processingProgress} className="w-full h-2" />
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div className={`p-4 border rounded-lg ${
                      processingProgress >= 30 ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-medium ${
                          processingProgress >= 30 ? 'text-green-900' : 'text-gray-700'
                        }`}>
                          Text Extraction
                        </span>
                        {processingProgress >= 30 ? (
                          <CheckCircle className="text-green-600" size={16} />
                        ) : (
                          <Clock className="text-gray-400" size={16} />
                        )}
                      </div>
                      <p className={`text-xs mt-1 ${
                        processingProgress >= 30 ? 'text-green-600' : 'text-gray-500'
                      }`}>
                        {processingProgress >= 30 ? 'Completed' : 'Pending'}
                      </p>
                    </div>
                    
                    <div className={`p-4 border rounded-lg ${
                      processingProgress >= 70 ? 'bg-green-50 border-green-200' : 
                      processingProgress >= 30 ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-medium ${
                          processingProgress >= 70 ? 'text-green-900' : 
                          processingProgress >= 30 ? 'text-blue-900' : 'text-gray-700'
                        }`}>
                          AI Parsing
                        </span>
                        {processingProgress >= 70 ? (
                          <CheckCircle className="text-green-600" size={16} />
                        ) : processingProgress >= 30 ? (
                          <LoaderPinwheel className="text-blue-600 animate-spin" size={16} />
                        ) : (
                          <Clock className="text-gray-400" size={16} />
                        )}
                      </div>
                      <p className={`text-xs mt-1 ${
                        processingProgress >= 70 ? 'text-green-600' : 
                        processingProgress >= 30 ? 'text-blue-600' : 'text-gray-500'
                      }`}>
                        {processingProgress >= 70 ? 'Completed' : processingProgress >= 30 ? 'In Progress' : 'Pending'}
                      </p>
                    </div>
                    
                    <div className={`p-4 border rounded-lg ${
                      processingProgress >= 100 ? 'bg-green-50 border-green-200' : 
                      processingProgress >= 70 ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-medium ${
                          processingProgress >= 100 ? 'text-green-900' : 
                          processingProgress >= 70 ? 'text-blue-900' : 'text-gray-700'
                        }`}>
                          Similarity Scoring
                        </span>
                        {processingProgress >= 100 ? (
                          <CheckCircle className="text-green-600" size={16} />
                        ) : processingProgress >= 70 ? (
                          <LoaderPinwheel className="text-blue-600 animate-spin" size={16} />
                        ) : (
                          <Clock className="text-gray-400" size={16} />
                        )}
                      </div>
                      <p className={`text-xs mt-1 ${
                        processingProgress >= 100 ? 'text-green-600' : 
                        processingProgress >= 70 ? 'text-blue-600' : 'text-gray-500'
                      }`}>
                        {processingProgress >= 100 ? 'Completed' : processingProgress >= 70 ? 'In Progress' : 'Pending'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}
