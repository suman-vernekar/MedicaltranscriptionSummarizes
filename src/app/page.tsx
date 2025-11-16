'use client';
import Link from "next/link";
import Image from "next/image";
import { Stethoscope, UploadCloud, Bot, DownloadCloud, Activity, BrainCircuit, HeartPulse, ShieldCheck, Pill, MessagesSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { useEffect, useRef } from "react";

export default function Home() {
  const heroImage = PlaceHolderImages.find((p) => p.id === 'feature-hero');
  
  const sectionsRef = useRef<HTMLElement[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: "0px",
        threshold: 0.15,
      }
    );

    sectionsRef.current.forEach((section) => {
      if (section) {
        observer.observe(section);
      }
    });

    return () => {
      sectionsRef.current.forEach((section) => {
        if (section) {
          observer.unobserve(section);
        }
      });
    };
  }, []);


  const services = [
    {
      icon: <Activity className="h-6 w-6 text-primary" />,
      title: "Health Doubts",
      description: "Get answers to your health-related questions and concerns from an AI-powered assistant."
    },
    {
      icon: <HeartPulse className="h-6 w-6 text-primary" />,
      title: "Lab Reports",
      description: "Analyze your lab reports and understand complex biomarkers with ease."
    },
    {
      icon: <BrainCircuit className="h-6 w-6 text-primary" />,
      title: "Diet & Fitness",
      description: "Receive personalized diet plans and fitness routines tailored to your health goals."
    },
    {
      icon: <Pill className="h-6 w-6 text-primary" />,
      title: "Medication Info",
      description: "Gain insights into your medications, their uses, and potential side effects."
    },
    {
      icon: <ShieldCheck className="h-6 w-6 text-primary" />,
      title: "OTC Remedies",
      description: "Find information on over-the-counter remedies for common ailments."
    },
    {
      icon: <MessagesSquare className="h-6 w-6 text-primary" />,
      title: "General Health Questions",
      description: "Ask any general health questions and get reliable information in an instant."
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="px-4 lg:px-6 h-16 flex items-center bg-background/80 backdrop-blur-sm sticky top-0 z-50 border-b">
        <Link href="/" className="flex items-center justify-center">
          <Stethoscope className="h-6 w-6 text-primary" />
          <span className="ml-2 text-xl font-bold font-headline">MediSummarize</span>
        </Link>
        <nav className="ml-auto flex gap-2 sm:gap-4">
          <Button variant="ghost" asChild>
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild className="bg-primary hover:bg-primary/90">
            <Link href="/register">Get Started</Link>
          </Button>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px] items-center">
              <div className="flex flex-col justify-center space-y-4 fade-in-up">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline">
                    Effortless Medical Summaries with AI
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Upload your medical transcriptions (images or PDFs) and get concise, accurate summaries in seconds.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
                    <Link href="/register">Start for Free</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link href="#features">Learn More</Link>
                  </Button>
                </div>
              </div>
              <Image
                src={heroImage?.imageUrl || "https://picsum.photos/seed/hero/600/400"}
                data-ai-hint={heroImage?.imageHint || "doctor computer"}
                width={600}
                height={400}
                alt="Hero"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full lg:order-last fade-in-scale"
              />
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-muted/50" ref={(el) => { el && !sectionsRef.current.includes(el) && sectionsRef.current.push(el); }}>
          <div className="container px-4 md:px-6 animated-section">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm font-medium">Key Features</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Streamline Your Workflow</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Focus on what matters most—your patients. Let MediSummarize handle the paperwork.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3 mt-12">
              <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="rounded-full bg-primary/10 p-3">
                    <UploadCloud className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Easy Uploads</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Securely upload medical documents in various formats, including images and PDFs.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="rounded-full bg-primary/10 p-3">
                    <Bot className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>AI-Powered Summaries</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Our advanced AI extracts key information and generates clear, concise summaries.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="rounded-full bg-primary/10 p-3">
                    <DownloadCloud className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Download & Share</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Instantly download summaries as text files for your records or for sharing.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

         <section id="services" className="w-full py-12 md:py-24 lg:py-32" ref={(el) => { el && !sectionsRef.current.includes(el) && sectionsRef.current.push(el); }}>
            <div className="container px-4 md:px-6 animated-section">
                <div className="flex flex-col items-center justify-center space-y-4 text-center">
                    <div className="space-y-2">
                        <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm font-medium">What We Offer</div>
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Your Personal Health Assistant</h2>
                        <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                            Beyond summaries, get answers and insights into a wide range of health topics.
                        </p>
                    </div>
                </div>
                <div className="mx-auto grid max-w-5xl items-stretch gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3 mt-12">
                    {services.map((service, index) => (
                        <Card key={index} className="flex flex-col">
                            <CardHeader className="flex flex-row items-center gap-4">
                                <div className="rounded-full bg-primary/10 p-3">
                                    {service.icon}
                                </div>
                                <CardTitle>{service.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">{service.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>

      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">&copy; 2024 MediSummarize. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:underline underline-offset-4">
            Terms of Service
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
