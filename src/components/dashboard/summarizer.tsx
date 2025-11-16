
'use client';

import React, { useState, useRef, useTransition, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud, FileText, Loader2, Download, XCircle, File as FileIcon, X, HelpCircle, MessageSquare, Send } from "lucide-react";
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { generateSummaryAction, askQuestionAction } from "@/app/actions";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useFirebase, setDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase";
import { collection, doc } from "firebase/firestore";
import { cn } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

type SummaryLength = 'short' | 'medium' | 'long' | 'custom';
type QnaPair = { question: string; answer: string; };

interface SummarizerProps {
  initialSummary?: string | null;
  initialMedicines?: string[];
  initialQna?: QnaPair[];
  historyId?: string | null;
}

export function Summarizer({ 
  initialSummary = null, 
  initialMedicines = [], 
  initialQna = [],
  historyId = null
}: SummarizerProps) {
  const { user, isUserLoading, firestore, storage } = useFirebase();
  const router = useRouter();

  const [files, setFiles] = useState<File[]>([]);
  const [fileDataUris, setFileDataUris] = useState<string[]>([]);
  const [summary, setSummary] = useState<string | null>(initialSummary);
  const [medicines, setMedicines] = useState<string[]>(initialMedicines);
  const [summaryLength, setSummaryLength] = useState<SummaryLength>('medium');
  const [customLength, setCustomLength] = useState<number>(500); // Default custom length
  const [isSummarizing, startSummarizeTransition] = useTransition();

  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const [currentHistoryId, setCurrentHistoryId] = useState<string | null>(historyId);
  const [question, setQuestion] = useState("");
  const [qna, setQna] = useState<QnaPair[]>(initialQna);
  const [isAsking, startAskTransition] = useTransition();

  const exampleQuestions = [
    "What was the main diagnosis?",
    "List all prescribed medications.",
    "What are the follow-up instructions?",
    "Were there any allergies mentioned?",
  ];

  // Load existing Q&A data when component mounts and we have a historyId
  useEffect(() => {
    if (historyId && firestore && user) {
      // If we have initial Q&A data, we don't need to fetch it again
      if (initialQna.length > 0) {
        return;
      }
      
      // In a real implementation, you might want to fetch Q&A data from Firestore here
      // For now, we'll rely on the initialQna prop
    }
  }, [historyId, firestore, user, initialQna]);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      addFiles(Array.from(selectedFiles));
    }
  };

  const addFiles = (newFiles: File[]) => {
     const validFiles = newFiles.filter(file =>
        file.type.startsWith("image/") || file.type === "application/pdf"
      );

      if (validFiles.length !== newFiles.length) {
        toast({
          variant: "destructive",
          title: "Invalid File Type",
          description: "Please upload only image or PDF files.",
        });
      }

      if(validFiles.length === 0) {
          return;
      }

      const combinedFiles = [...files, ...validFiles];
      setFiles(combinedFiles);
      resetSummaryState();

      const filePromises = combinedFiles.map(file => {
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      });

      Promise.all(filePromises).then(setFileDataUris).catch(() => {
          toast({
              variant: "destructive",
              title: "File Read Error",
              description: "Could not read one or more files."
          })
      });
  }

  const handleSummarize = () => {
    if (fileDataUris.length === 0 || files.length === 0 || !user || !firestore || !storage) return;

    startSummarizeTransition(async () => {
      // 1. Get a new document reference for the history
      const historyCollectionRef = collection(firestore, 'users', user.uid, 'summaryHistory');
      const newHistoryDocRef = doc(historyCollectionRef);
      setCurrentHistoryId(newHistoryDocRef.id);

      // 2. Call the AI action to get the summary (don't wait for file uploads)
      // For custom length, we'll need to modify the approach
      let actualSummaryLength: 'short' | 'medium' | 'long' = 'medium';
      if (summaryLength !== 'custom') {
        actualSummaryLength = summaryLength as 'short' | 'medium' | 'long';
      } else {
        // For custom length, we'll use medium as default and handle custom length in the prompt
        actualSummaryLength = 'medium';
      }

      const summaryPromise = generateSummaryAction({ 
        fileDataUris, 
        summaryLength: actualSummaryLength
      });

      // 3. Immediately save initial history data without file URLs
      const initialHistoryData = {
        userId: user.uid,
        uploadDate: new Date().toISOString(),
        summaryText: "Generating...", // Placeholder
        originalDocumentName: files.map(f => f.name).join(', '),
        summaryLength: summaryLength,
        files: [],
        qna: [],
      };
      setDocumentNonBlocking(newHistoryDocRef, initialHistoryData, { merge: true });

      // 4. Handle summary result when it's ready
      summaryPromise.then(result => {
        if (result.error) {
          toast({
            variant: "destructive",
            title: "Summarization Failed",
            description: result.error,
          });
          // Optionally delete the placeholder document
          return;
        }
        if (result.summary) {
          setSummary(result.summary);
          setMedicines(result.medicines || []);

          // Update the history document with the actual summary
          updateDocumentNonBlocking(newHistoryDocRef, { summaryText: result.summary });

          toast({
            title: "Summary Complete",
            description: "The summary has been generated and saved.",
          });
        }
      });
      
      // 5. Upload files in the background and update history when done
      const uploadAndSaveFiles = async () => {
          try {
              const uploadedFiles = await Promise.all(
                files.map(async (file) => {
                  const storageRef = ref(storage, `users/${user.uid}/summaries/${newHistoryDocRef.id}/${file.name}`);
                  await uploadBytes(storageRef, file);
                  const url = await getDownloadURL(storageRef);
                  return { name: file.name, url };
                })
              );
              // Update the history document with the file URLs
              updateDocumentNonBlocking(newHistoryDocRef, { files: uploadedFiles });
          } catch (uploadError) {
              console.error("File upload failed:", uploadError);
              // Optionally notify user that file upload failed but summary was saved
          }
      };
      
      uploadAndSaveFiles();

    });
  };

  const handleAskQuestion = () => {
    if (!question.trim() || !summary || !currentHistoryId || !user || !firestore) return;

    const currentQuestion = question;
    const newQnaPair = { question: currentQuestion, answer: "Thinking..." };
    setQna(prevQna => [...prevQna, newQnaPair]);
    setQuestion("");

    startAskTransition(async () => {
        const result = await askQuestionAction({
            summary,
            question: currentQuestion,
            medicines,
        });

        const updatedQna = [...qna, { question: currentQuestion, answer: result.answer || "Sorry, I couldn't find an answer." }];
        setQna(updatedQna);
        
        // Update history in firestore
        const historyDocRef = doc(firestore, 'users', user.uid, 'summaryHistory', currentHistoryId);
        updateDocumentNonBlocking(historyDocRef, { qna: updatedQna });
    });
  };

  const downloadSummary = () => {
    if (!summary) return;
    const blob = new Blob([summary], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "medical-summary.txt";
    document.body.appendChild(a);
a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const resetSummaryState = () => {
    setSummary(null);
    setMedicines([]);
    setQna([]);
    setCurrentHistoryId(null);
  }

  const removeFile = (indexToRemove: number) => {
      setFiles(files.filter((_, index) => index !== indexToRemove));
      setFileDataUris(fileDataUris.filter((_, index) => index !== indexToRemove));
      if (files.length === 1) {
          resetState();
      }
  };

  const resetState = () => {
    setFiles([]);
    setFileDataUris([]);
    resetSummaryState();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  
  const handleDragEvents = (e: React.DragEvent<HTMLDivElement>, isEntering: boolean) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(isEntering);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
      handleDragEvents(e, false);
      const droppedFiles = e.dataTransfer.files;
      if (droppedFiles && droppedFiles.length > 0) {
          addFiles(Array.from(droppedFiles));
      }
  };
  
  const isPending = isSummarizing || isAsking;

  const escapeRegExp = (string: string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  const highlightedSummary = useMemo((): JSX.Element | null => {
    if (!summary) return null;

    if (medicines.length === 0) {
      return <p className="whitespace-pre-wrap text-sm">{summary}</p>;
    }

    try {
      const regex = new RegExp(`\\b(${medicines.map(escapeRegExp).join('|')})\\b`, 'gi');
      const parts = summary.split(regex);

      return (
          <p className="whitespace-pre-wrap text-sm">
              {parts.map((part, index) => {
                  // Check if part is a valid string before processing
                  if (typeof part !== 'string') {
                      return <span key={index}></span>;
                  }
                  const isMedicine = medicines.some(med => med.toLowerCase() === part.toLowerCase());
                  return isMedicine ? (
                      <span key={index} className="bg-accent/30 text-accent-foreground font-semibold rounded px-1 py-0.5">
                          {part}
                      </span>
                  ) : (
                      part
                  );
              })}
          </p>
      );
    } catch (error) {
      // Fallback to plain text if there's an error in processing
      return <p className="whitespace-pre-wrap text-sm">{summary}</p>;
    }
  }, [summary, medicines]);


  if (isUserLoading) {
      return (
          <div className="flex h-full w-full items-center justify-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
      )
  }

  return (
    <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2">
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UploadCloud className="text-accent" />
            Upload Transcription
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-6 space-y-4">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*,application/pdf"
            multiple
          />
          {files.length === 0 ? (
            <div
              className={cn(
                "relative w-full h-full min-h-[12rem] border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-accent transition-colors",
                isDragging && "border-accent bg-accent/10"
              )}
              onClick={() => fileInputRef.current?.click()}
              onDragEnter={(e) => handleDragEvents(e, true)}
              onDragLeave={(e) => handleDragEvents(e, false)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
            >
              {isDragging ? (
                  <div className="text-center text-accent font-semibold">
                      <UploadCloud className="w-12 h-12 mx-auto" />
                      <p className="mt-2">Drop files here</p>
                  </div>
              ) : (
                  <div className="text-center text-muted-foreground">
                    <UploadCloud className="w-12 h-12 mx-auto" />
                    <p className="mt-4">Click or drag files to upload</p>
                    <p className="text-xs mt-1">Image or PDF files only</p>
                  </div>
              )}
            </div>
          ) : (
            <div className="w-full space-y-4">
                <ScrollArea className="h-48 w-full pr-4">
                    <div className="space-y-3">
                        {files.map((file, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <FileIcon className="h-6 w-6 text-primary flex-shrink-0"/>
                                    <span className="text-sm font-medium truncate">{file.name}</span>
                                </div>
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => removeFile(index)}>
                                    <X className="h-4 w-4"/>
                                </Button>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
              <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="w-full">
                <UploadCloud className="mr-2 h-4 w-4" /> Add More Files
              </Button>
              <Button variant="ghost" onClick={resetState} className="w-full">
                <XCircle className="mr-2 h-4 w-4" /> Clear All Files
              </Button>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex-col items-start gap-4">
            <div className="w-full space-y-2">
                <Label>Summary Length</Label>
                <RadioGroup
                    defaultValue="medium"
                    onValueChange={(value: string) => setSummaryLength(value as SummaryLength)}
                    className="flex space-x-4"
                    disabled={isPending}
                >
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="short" id="r1" />
                        <Label htmlFor="r1">Short</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="medium" id="r2" />
                        <Label htmlFor="r2">Medium</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="long" id="r3" />
                        <Label htmlFor="r3">Long</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="custom" id="custom" />
                        <Label htmlFor="custom">Custom</Label>
                    </div>
                </RadioGroup>
                {/* Custom length input */}
                {summaryLength === 'custom' && (
                    <div className="flex items-center space-x-2 mt-2">
                        <Input
                            type="number"
                            placeholder="Characters (e.g. 500)"
                            min="50"
                            max="5000"
                            step="50"
                            className="w-32"
                            disabled={isPending}
                            value={customLength}
                            onChange={(e) => {
                                const value = parseInt(e.target.value);
                                if (!isNaN(value)) {
                                    setCustomLength(value);
                                }
                            }}
                        />
                        <span className="text-sm text-muted-foreground">characters</span>
                    </div>
                )}
            </div>
          <Button onClick={handleSummarize} disabled={files.length === 0 || isPending} className="w-full bg-accent hover:bg-accent/90">
            {isSummarizing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Summarize &amp; Save
          </Button>
        </CardFooter>
      </Card>

      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="text-accent" />
            Generated Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 p-6 flex flex-col gap-4">
          <ScrollArea className="h-full w-full rounded-md border p-4 min-h-[20rem]">
            {isSummarizing && !summary && (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
                <p className="mt-4">Generating summary...</p>
              </div>
            )}
            {!isSummarizing && !summary && (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                <p>Your AI-generated summary will appear here after you upload and process a document.</p>
              </div>
            )}
            {summary && highlightedSummary}
          </ScrollArea>
           {summary && (
            <div className="space-y-6 pt-4 border-t">
                <div className="space-y-2">
                    <h4 className="font-semibold flex items-center gap-2"><HelpCircle className="text-accent"/> Ask a Follow-up Question</h4>
                    <div className="flex flex-wrap gap-2">
                        {exampleQuestions.map(q => (
                            <Badge key={q} variant="outline" className="cursor-pointer" onClick={() => setQuestion(q)}>{q}</Badge>
                        ))}
                    </div>
                </div>
                <div className="flex-1 space-y-4">
                    <ScrollArea className="h-40 w-full rounded-md border p-4">
                        {qna.length === 0 && (
                            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                                Q&amp;A history will appear here.
                            </div>
                        )}
                        <div className="space-y-4">
                            {qna.map((item, index) => (
                                <div key={index}>
                                    <p className="font-bold text-sm">{item.question}</p>
                                    <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{item.answer}</p>
                                </div>
                            ))}
                            {isAsking && qna[qna.length -1]?.answer === 'Thinking...' && (
                                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                    <Loader2 className="w-4 h-4 animate-spin"/>
                                    <span>Thinking...</span>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                    <div className="flex items-center gap-2">
                        <Input 
                            placeholder="Type your question..." 
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && !isPending && handleAskQuestion()}
                            disabled={isPending}
                        />
                        <Button onClick={handleAskQuestion} disabled={isPending || !question.trim()}>
                            {isAsking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        </Button>
                    </div>
                </div>
            </div>
           )}
        </CardContent>
        <CardFooter>
          <Button onClick={downloadSummary} disabled={!summary || isPending} className="w-full">
            <Download className="mr-2 h-4 w-4" />
            Download Summary
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
