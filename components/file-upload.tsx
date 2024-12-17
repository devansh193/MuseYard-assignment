"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FileText, AlertCircle, CheckCircle2 } from "lucide-react";
import { parseChat } from "@/lib/chat-parser";
import ParsedResults from "./parsed-result";

interface ParsedMessage {
  timestamp: string;
  sender: string;
  content: string;
  category: string;
  data?: string[];
}

interface ParsedCategories {
  "Links/URLs": ParsedMessage[];
  "Quotes/Insights": ParsedMessage[];
  "Reading Lists": ParsedMessage[];
  "Personal Notes": ParsedMessage[];
}

export default function FileUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [parsedData, setParsedData] = useState<ParsedCategories | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFile = event.target.files?.[0];
    setError(null);
    setSuccess(false);
    setParsedData(null);

    if (!selectedFile) {
      setFile(null);
      return;
    }
    if (!selectedFile.name.endsWith(".txt")) {
      setError("Please upload a .txt file.");
      setFile(null);
      return;
    }
    if (selectedFile.size === 0) {
      setError("The file is empty.");
      setFile(null);
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("File size should not exceed 10MB.");
      setFile(null);
      return;
    }

    setFile(selectedFile);
    setSuccess(true);

    try {
      const content = await selectedFile.text();
      const result = normalizeParsedData(parseChat(content));
      setParsedData(result);
    } catch (err) {
      setError("Error parsing the chat file.");
      console.error("Parsing Error:", err);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const normalizeParsedData = (data: any): ParsedCategories => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const normalizeMessage = (message: any): ParsedMessage => ({
      timestamp: message.timestamp || "",
      sender: message.sender || "",
      content: message.content || "",
      category: message.category || "",
      data: Array.isArray(message.data)
        ? message.data
        : message.data
        ? [message.data]
        : undefined,
    });

    return {
      "Links/URLs": (data["Links/URLs"] || []).map(normalizeMessage),
      "Quotes/Insights": (data["Quotes/Insights"] || []).map(normalizeMessage),
      "Reading Lists": (data["Reading Lists"] || []).map(normalizeMessage),
      "Personal Notes": (data["Personal Notes"] || []).map(normalizeMessage),
    };
  };

  const handleUpload = () => {
    if (file) {
      console.log("Uploaded file:", file.name);
      setFile(null);
      setSuccess(false);
      setParsedData(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="w-[900px] p-10 bg-white rounded-lg shadow-md">
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <FileText className="h-6 w-6 text-blue-500" />
          <h2 className="text-2xl font-bold">WhatsApp Chat Parser</h2>
        </div>

        <div className="space-y-2">
          <Label htmlFor="file-upload">
            Choose a WhatsApp chat export file (.txt)
          </Label>
          <Input
            id="file-upload"
            type="file"
            accept=".txt"
            onChange={handleFileChange}
            ref={fileInputRef}
          />
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && !parsedData && (
          <Alert className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>
              File is valid and ready for parsing.
            </AlertDescription>
          </Alert>
        )}
        <Button onClick={handleUpload} className="w-full">
          {parsedData ? "Reset File" : "Upload File"}
        </Button>
      </div>

      {parsedData && <ParsedResults data={parsedData} />}
    </div>
  );
}
