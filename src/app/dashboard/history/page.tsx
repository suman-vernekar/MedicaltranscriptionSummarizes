
'use client';

import { useState } from 'react';
import { useCollection, useFirebase, useMemoFirebase, deleteDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { FileText, AlertTriangle, Trash2, Paperclip, Download, Ruler, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from '@/components/ui/button';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';


export default function HistoryPage() {
  const { firestore, user } = useFirebase();
  const { toast } = useToast();

  const historyQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'users', user.uid, 'summaryHistory'),
      orderBy('uploadDate', 'desc')
    );
  }, [firestore, user]);

  const { data: history, isLoading, error } = useCollection(historyQuery);

  const handleDelete = (summaryId: string) => {
    if (!firestore || !user) return;
    const docRef = doc(firestore, 'users', user.uid, 'summaryHistory', summaryId);
    deleteDocumentNonBlocking(docRef);
    toast({
        title: "History Deleted",
        description: "The summary has been removed from your history.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Summary History</CardTitle>
        <CardDescription>View and manage your previously generated summaries.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[70vh]">
          {isLoading && (
            <div className="space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          )}
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                Failed to load summary history. Please try again later.
              </AlertDescription>
            </Alert>
          )}
          {!isLoading && !error && history && history.length === 0 && (
            <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-48">
              <FileText className="w-12 h-12 mb-4" />
              <p>No summary history found.</p>
              <p className="text-sm">Generate a new summary to see it here.</p>
            </div>
          )}
          {!isLoading && !error && history && history.length > 0 && (
             <Accordion type="multiple" className="w-full space-y-4">
              {history.map((item) => (
                <AccordionItem value={item.id} key={item.id}>
                    <Card>
                        <div className="flex items-center p-6">
                            <AccordionTrigger className="flex-1 text-left p-0">
                                <div className="flex-1">
                                    <CardTitle className="text-lg truncate">{item.originalDocumentName}</CardTitle>
                                    <p className="text-sm text-muted-foreground mt-1">
                                    {format(new Date(item.uploadDate), "PPP p")}
                                    </p>
                                </div>
                            </AccordionTrigger>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="ml-4 text-destructive hover:text-destructive hover:bg-destructive/10">
                                        <Trash2 className="h-5 w-5" />
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete this summary
                                        from our servers.
                                    </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={() => handleDelete(item.id)}
                                        className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                                    >
                                        Delete
                                    </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                        <AccordionContent>
                           <CardContent className="pt-0">
                                <div className="flex items-center gap-4 mb-4">
                                     {item.summaryLength && (
                                        <Badge variant="outline" className="capitalize flex items-center gap-1.5">
                                            <Ruler className="w-3 h-3"/>
                                            {item.summaryLength}
                                        </Badge>
                                     )}
                                </div>
                                <h4 className="font-semibold mb-2">Summary</h4>
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap mb-6">
                                  {item.summaryText}
                                </p>

                                {item.files && item.files.length > 0 && (
                                    <div className="mb-6">
                                        <h4 className="font-semibold mb-4 flex items-center gap-2"><Paperclip className="w-5 h-5"/> Attached Files</h4>
                                        <div className="space-y-2">
                                            {item.files.map((file: any, index: number) => (
                                                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                                    <span className="text-sm font-medium truncate">{file.name}</span>
                                                    <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                                                        <Link href={file.url} target="_blank" download={file.name}>
                                                            <Download className="h-4 w-4"/>
                                                        </Link>
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {item.qna && item.qna.length > 0 && (
                                    <div className="mb-6">
                                        <h4 className="font-semibold mb-4 flex items-center gap-2"><MessageSquare className="w-5 h-5"/> Q&amp;A History</h4>
                                        <div className="space-y-4">
                                            {item.qna.map((qnaItem: any, index: number) => (
                                                <div key={index} className="p-3 bg-muted/50 rounded-lg text-sm">
                                                    <p className="font-semibold text-foreground">{qnaItem.question}</p>
                                                    <p className="text-muted-foreground mt-1 whitespace-pre-wrap">{qnaItem.answer}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                           </CardContent>
                        </AccordionContent>
                    </Card>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
