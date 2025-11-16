"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React, { useState, useEffect } from "react";
import { useAuth, useUser, setDocumentNonBlocking } from "@/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { doc } from 'firebase/firestore';
import { useFirestore } from "@/firebase";


export function RegisterForm() {
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push("/dashboard");
    }
  }, [user, isUserLoading, router]);


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;

      if (newUser && firestore) {
        const userDocRef = doc(firestore, "users", newUser.uid);
        const userData = {
          id: newUser.uid,
          email: newUser.email,
          fullName: fullName,
        };
        setDocumentNonBlocking(userDocRef, userData, { merge: true });
      }
      
      // Let the useEffect handle the redirect
    } catch (error: any) {
      console.error("Registration Error:", error);
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: error.message || "An unexpected error occurred.",
      });
      setIsSubmitting(false);
    }
  };
  
    if (isUserLoading || user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Stethoscope className="h-12 w-12 animate-pulse text-primary" />
      </div>
    );
  }

  return (
    <Card className="mx-auto max-w-sm w-full">
      <CardHeader className="text-center">
        <Stethoscope className="mx-auto h-12 w-12 text-primary" />
        <CardTitle className="text-2xl mt-4 font-headline">Create an Account</CardTitle>
        <CardDescription>
          Enter your information to create an account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="full-name">Full Name</Label>
            <Input 
              id="full-name" 
              placeholder="John Doe" 
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input 
              id="password" 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          <Button type="submit" className="w-full bg-accent hover:bg-accent/90" disabled={isSubmitting}>
             {isSubmitting ? "Creating Account..." : "Create Account"}
          </Button>
        </form>
        <div className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <Link href="/login" className="underline">
            Login
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
