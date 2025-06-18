import { queryClient } from "./queryClient";

const API_BASE = "";

async function makeRequest(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem("auth_token");
  
  const defaultHeaders: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    defaultHeaders.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || response.statusText);
  }

  return response;
}

export async function uploadFiles(jobDescription: File, resumes: File[]) {
  const formData = new FormData();
  formData.append("jobDescription", jobDescription);
  
  resumes.forEach((resume) => {
    formData.append("resumes", resume);
  });

  const token = localStorage.getItem("auth_token");
  const response = await fetch("/api/upload", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Upload failed");
  }

  return response.json();
}

export async function processResumes(jobDescriptionId: number, resumeIds: number[]) {
  return makeRequest("/api/process", {
    method: "POST",
    body: JSON.stringify({ jobDescriptionId, resumeIds }),
  }).then(res => res.json());
}

export async function getResults() {
  return makeRequest("/api/results").then(res => res.json());
}

export async function getAnalytics() {
  return makeRequest("/api/analytics").then(res => res.json());
}

export async function getResult(id: number) {
  return makeRequest(`/api/result/${id}`).then(res => res.json());
}
