"use client";

import { Mail, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { apiClient, errorMessage } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input, Textarea } from "@/components/ui/input";

interface ContactOwnerButtonProps {
  propertyId: string;
  ownerId: string;
  propertyTitle: string;
  isAuthenticated: boolean;
  disabled?: boolean;
}

/**
 * Sends a direct message to the property owner. `GET /users/*` is admin-only, so
 * the owner is addressed by the `ownerId` carried on the property payload.
 */
export function ContactOwnerButton({
  propertyId,
  ownerId,
  propertyTitle,
  isAuthenticated,
  disabled,
}: ContactOwnerButtonProps) {
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState(`Question about ${propertyTitle}`);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  async function send() {
    if (body.trim().length < 1) {
      toast.error("Write a message first");
      return;
    }
    setSending(true);
    try {
      await apiClient("/messages", {
        method: "POST",
        body: {
          recipientId: ownerId,
          subject: subject.trim() || `Question about ${propertyTitle}`,
          body: body.trim(),
          propertyId,
        },
      });
      toast.success("Message sent", { description: "The owner can reply from their dashboard." });
      setOpen(false);
      setBody("");
    } catch (error) {
      toast.error("Could not send the message", { description: errorMessage(error) });
    } finally {
      setSending(false);
    }
  }

  if (!isAuthenticated) {
    return (
      <Button asChild variant="outline" disabled={disabled}>
        <a href={`/login?next=/properties/${propertyId}`}>
          <Mail />
          Sign in to message the owner
        </a>
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" disabled={disabled}>
          <Mail />
          Message owner
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Message the owner</DialogTitle>
          <DialogDescription>
            Your message is linked to {propertyTitle} so the owner knows which listing it is about.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Field label="Subject" htmlFor="contact-subject">
            <Input
              id="contact-subject"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              maxLength={200}
            />
          </Field>
          <Field label="Message" htmlFor="contact-body" required>
            <Textarea
              id="contact-body"
              rows={5}
              value={body}
              onChange={(event) => setBody(event.target.value)}
              maxLength={5000}
              placeholder="Ask about availability, the move-in date, utilities or a viewing."
            />
          </Field>
          <p className="text-xs text-muted-foreground">{body.trim().length} / 5000 characters</p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={sending}>
            Cancel
          </Button>
          <Button onClick={() => void send()} loading={sending}>
            <Send />
            Send message
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
