import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with feli7xrescent. Booking inquiries, press requests, and general/fan mail are routed separately.",
};

export default function ContactPage() {
  return <ContactForm />;
}
