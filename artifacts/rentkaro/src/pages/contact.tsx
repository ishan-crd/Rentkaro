import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Mail, Phone, MapPin, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Contact() {
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message Sent",
      description: "Our support team will get back to you within 24 hours.",
    });
    (e.target as HTMLFormElement).reset();
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Contact & Support</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Have questions about finding a PG or listing your property? We're here to help.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>Send us a message</CardTitle>
              <CardDescription>Fill out the form below and we'll be in touch.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" required placeholder="John Doe" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" required placeholder="john@example.com" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" required placeholder="How can we help?" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea 
                    id="message" 
                    required 
                    placeholder="Provide details about your inquiry..." 
                    className="min-h-[150px]"
                  />
                </div>
                <Button type="submit" className="w-full">
                  <MessageSquare className="mr-2 h-4 w-4" /> Send Message
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 border rounded-xl bg-card">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0">
                    <Mail className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Email Us</h3>
                    <p className="text-muted-foreground">support@rentkaro.in</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 border rounded-xl bg-card">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0">
                    <Phone className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Call Us</h3>
                    <p className="text-muted-foreground">+91 1800 123 4567 (Mon-Sat, 9AM-6PM)</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 border rounded-xl bg-card">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Office</h3>
                    <p className="text-muted-foreground">123 Tech Park, HSR Layout, Bangalore 560102</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-center">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-left font-medium text-lg">Are there any brokerage fees on RentKaro?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-base">
                No, RentKaro is a zero-brokerage platform. You connect directly with PG owners. We only charge a small platform fee upon successful booking confirmation.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger className="text-left font-medium text-lg">How are properties verified?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-base">
                Our team physically verifies a sample of properties and checks identity documents of all owners. Properties with the "Verified" badge have passed our stringent checks.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger className="text-left font-medium text-lg">What happens after I send an inquiry?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-base">
                The owner receives your details and message. They can approve or reject the inquiry from their dashboard. Once approved, you will receive their contact details to finalize the move-in.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger className="text-left font-medium text-lg">Can I list multiple properties as an owner?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-base">
                Yes, owner accounts can list and manage an unlimited number of PG properties from a single dashboard. You get consolidated stats and inquiry management tools.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-5">
              <AccordionTrigger className="text-left font-medium text-lg">How does the Sentiment Score work?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-base">
                Our machine learning model analyzes the text of all reviews for a property to determine the overall sentiment (positive, neutral, or negative). This helps you quickly gauge the actual living experience beyond just the star rating.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </Layout>
  );
}
