import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { CONDITION_LABELS, TYPE_LABELS } from "@/lib/constants";

const PROPOSAL_STATUS_LABELS = {
  pending: "Εκκρεμεί",
  accepted: "Αποδεκτή",
  rejected: "Απορρίφθηκε",
};

export default function ProposalDetail() {
  const { id } = useParams();
  const { user } = useAuth();

  const [proposal, setProposal] = useState(null);
  const [listing, setListing] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const [reviewRating, setReviewRating] = useState("5");
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [existingReview, setExistingReview] = useState(null);

  const [showReportForm, setShowReportForm] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [reportError, setReportError] = useState("");

  async function loadEverything() {
    setIsLoading(true);
    try {
      const proposalData = await api.get(`/proposals/${id}`);
      setProposal(proposalData);
      const listingData = await api.get(`/listings/${proposalData.listing_id}`);
      setListing(listingData);
      const messagesData = await api.get(`/proposals/${id}/messages`);
      setMessages(messagesData);
      const reviews = await api.get(`/proposals/${id}/reviews`).catch(() => []);
      const myReview = reviews.find((r) => r.reviewer_id === user?.id);
      if (myReview) {
        setExistingReview(myReview);
        setReviewSubmitted(true);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadEverything();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleStatusChange(status) {
    try {
      const updated = await api.patch(`/proposals/${id}/status`, { status });
      setProposal(updated);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleSendMessage(event) {
    event.preventDefault();
    if (!newMessage.trim()) return;
    try {
      const message = await api.post(`/proposals/${id}/messages`, { content: newMessage });
      setMessages((prev) => [...prev, message]);
      setNewMessage("");
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleSubmitReview(event) {
    event.preventDefault();
    setReviewError("");
    try {
      const createdReview = await api.post(`/proposals/${id}/reviews`, {
        rating: Number(reviewRating),
        comment: reviewComment || null,
      });
      setExistingReview(createdReview);
      setReviewSubmitted(true);
    } catch (err) {
      setReviewError(err.message);
    }
  }

  async function handleSubmitReport(event) {
    event.preventDefault();
    setReportError("");
    try {
      await api.post("/reports", {
        reported_user_id: counterpartyId,
        reason: reportReason,
      });
      setReportSubmitted(true);
    } catch (err) {
      setReportError(err.message);
    }
  }

  if (isLoading) return <p className="p-4 sm:p-8 text-muted-foreground">Φόρτωση...</p>;
  if (error) return <p className="p-4 sm:p-8 text-destructive">{error}</p>;
  if (!proposal || !listing) return null;

  const isOwner = user?.id === listing.owner_id;
  const counterpartyId = isOwner ? proposal.requester_id : listing.owner_id;
  const counterpartyName = isOwner ? proposal.requester_full_name : listing.owner_full_name;

  return (
    <div className="mx-auto max-w-2xl p-4 sm:p-8">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>
            Πρόταση για: <Link to={`/listings/${listing.id}`} className="underline">{listing.title}</Link>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm">
          <p>
            <span className="text-muted-foreground">Τύπος: </span>
            {TYPE_LABELS[proposal.type]}
          </p>
          <p>
            <span className="text-muted-foreground">Κατάσταση: </span>
            {PROPOSAL_STATUS_LABELS[proposal.status]}
          </p>

          {proposal.type === "exchange" && proposal.offered_books?.length > 0 && (
            <div className="mt-1 flex flex-col gap-1 rounded-md bg-secondary p-2.5">
              <span className="font-medium text-secondary-foreground">
                Προσφερόμενο βιβλίο για ανταλλαγή:
              </span>
              {proposal.offered_books.map((book) => (
                <div key={book.id} className="flex items-center gap-2">
                  <Link to={`/listings/${book.id}`} className="underline">
                    {book.title}
                  </Link>
                  <span className="text-xs text-muted-foreground">
                    ({CONDITION_LABELS[book.condition]})
                  </span>
                </div>
              ))}
            </div>
          )}

          {isOwner && proposal.status === "pending" && (
            <div className="mt-2 flex gap-2">
              <Button onClick={() => handleStatusChange("accepted")}>Αποδοχή</Button>
              <Button variant="outline" onClick={() => handleStatusChange("rejected")}>
                Απόρριψη
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-base">Μηνύματα</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {messages.length === 0 ? (
            <p className="text-sm text-muted-foreground">Δεν υπάρχουν μηνύματα ακόμα.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`rounded-md p-2 text-sm ${
                    message.sender_id === user.id ? "self-end bg-primary text-primary-foreground" : "bg-secondary"
                  }`}
                >
                  {message.content}
                </div>
              ))}
            </div>
          )}
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Γράψε μήνυμα..."
            />
            <Button type="submit">Αποστολή</Button>
          </form>
        </CardContent>
      </Card>

      {proposal.status === "accepted" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Αξιολόγηση</CardTitle>
          </CardHeader>
          <CardContent>
            {reviewSubmitted ? (
              <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                <p>Ευχαριστούμε για την αξιολόγηση!</p>
                {existingReview && (
                  <p>
                    Η βαθμολογία σου: ⭐ {existingReview.rating}/5
                    {existingReview.comment && ` — "${existingReview.comment}"`}
                  </p>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="flex flex-col gap-3">
                <label className="text-sm font-medium">
                  Βαθμολογία
                  <select
                    className="ml-2 h-9 rounded-md border border-input bg-background px-2 text-sm"
                    value={reviewRating}
                    onChange={(e) => setReviewRating(e.target.value)}
                  >
                    {[5, 4, 3, 2, 1].map((n) => (
                      <option key={n} value={n}>
                        {n} / 5
                      </option>
                    ))}
                  </select>
                </label>
                <Input
                  placeholder="Σχόλιο (προαιρετικό)"
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                />
                {reviewError && <p className="text-sm text-destructive">{reviewError}</p>}
                <Button type="submit">Υποβολή Αξιολόγησης</Button>
              </form>
            )}
          </CardContent>
        </Card>
      )}

      <Card className="mt-4">
        <CardContent className="pt-6">
          {reportSubmitted ? (
            <p className="text-sm text-muted-foreground">Η αναφορά υποβλήθηκε.</p>
          ) : showReportForm ? (
            <form onSubmit={handleSubmitReport} className="flex flex-col gap-3">
              <label className="text-sm font-medium">Λόγος αναφοράς για {counterpartyName}</label>
              <Input
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                placeholder="π.χ. δεν εμφανίστηκε στο ραντεβού παράδοσης"
                required
              />
              {reportError && <p className="text-sm text-destructive">{reportError}</p>}
              <div className="flex gap-2">
                <Button type="submit" variant="destructive" size="sm">
                  Υποβολή Αναφοράς
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setShowReportForm(false)}>
                  Άκυρο
                </Button>
              </div>
            </form>
          ) : (
            <button
              className="text-sm text-muted-foreground underline"
              onClick={() => setShowReportForm(true)}
            >
              Αναφορά χρήστη {counterpartyName}
            </button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
