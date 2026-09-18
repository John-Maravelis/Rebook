import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { API_BASE_URL, api } from "@/lib/api";
import { CONDITION_LABELS, STATUS_LABELS, TYPE_LABELS } from "@/lib/constants";

export default function ListingDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [listing, setListing] = useState(null);
  const [myBooks, setMyBooks] = useState([]);
  const [selectedBookId, setSelectedBookId] = useState("");
  const [error, setError] = useState("");
  const [proposalError, setProposalError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingProposal, setIsSubmittingProposal] = useState(false);
  const [statusError, setStatusError] = useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [ownerRating, setOwnerRating] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    api
      .get(`/listings/${id}`)
      .then(setListing)
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [id]);

  useEffect(() => {
    if (listing?.owner_id) {
      api
        .get(`/users/${listing.owner_id}/rating`)
        .then(setOwnerRating)
        .catch(() => {});
    }
  }, [listing?.owner_id]);

  // Για exchange αγγελίες, χρειαζόμαστε τα δικά μας ενεργά βιβλία ώστε να διαλέξει ο χρήστης τι προσφέρει.
  useEffect(() => {
    if (user && listing?.type === "exchange" && user.id !== listing.owner_id) {
      api
        .get(`/listings?owner_id=${user.id}&status_filter=active`)
        .then(setMyBooks)
        .catch(() => setMyBooks([]));
    }
  }, [user, listing]);

  async function handleSubmitProposal() {
    setProposalError("");
    setIsSubmittingProposal(true);
    try {
      const payload = { type: listing.type };
      if (listing.type === "exchange") {
        if (!selectedBookId) {
          setProposalError("Διάλεξε ποιο δικό σου βιβλίο προσφέρεις.");
          setIsSubmittingProposal(false);
          return;
        }
        payload.offered_book_ids = [Number(selectedBookId)];
      }
      const proposal = await api.post(`/listings/${id}/proposals`, payload);
      navigate(`/proposals/${proposal.id}`);
    } catch (err) {
      setProposalError(err.message);
    } finally {
      setIsSubmittingProposal(false);
    }
  }

  async function handleStatusChange(newStatus) {
    setStatusError("");
    setIsUpdatingStatus(true);
    try {
      const updated = await api.patch(`/listings/${id}/status`, { status: newStatus });
      setListing(updated);
    } catch (err) {
      setStatusError(err.message);
    } finally {
      setIsUpdatingStatus(false);
    }
  }

  if (isLoading) return <p className="p-4 sm:p-8 text-muted-foreground">Φόρτωση...</p>;
  if (error) return <p className="p-4 sm:p-8 text-destructive">{error}</p>;
  if (!listing) return null;

  const isOwner = user?.id === listing.owner_id;
  const canPropose = user && !isOwner && listing.status === "active";

  return (
    <div className="mx-auto max-w-2xl p-4 sm:p-8">
      <Card>
        <CardHeader>
          <CardTitle>{listing.title}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm">
          {listing.photos?.length > 0 && (
            <div className="mb-3 grid gap-3 sm:grid-cols-2">
              {listing.photos.map((photoUrl) => (
                <img
                  key={photoUrl}
                  src={`${API_BASE_URL}${photoUrl}`}
                  alt={`Φωτογραφία του βιβλίου ${listing.title}`}
                  className="h-56 w-full rounded-md border object-cover"
                />
              ))}
            </div>
          )}
          <p>
            <span className="text-muted-foreground">Τύπος: </span>
            {TYPE_LABELS[listing.type]}
          </p>
          <p>
            <span className="text-muted-foreground">Κατάσταση βιβλίου: </span>
            {CONDITION_LABELS[listing.condition]}
          </p>
          <p>
            <span className="text-muted-foreground">Κατάσταση αγγελίας: </span>
            {STATUS_LABELS[listing.status]}
          </p>
          {listing.isbn && (
            <p>
              <span className="text-muted-foreground">ISBN: </span>
              {listing.isbn}
            </p>
          )}
          {listing.edition && (
            <p>
              <span className="text-muted-foreground">Έκδοση: </span>
              {listing.edition}
            </p>
          )}
          {listing.type === "sale" && listing.price != null && (
            <p>
              <span className="text-muted-foreground">Τιμή: </span>
              {listing.price} €
            </p>
          )}
          <p>
            <span className="text-muted-foreground">Καταχωρήθηκε από: </span>
            {listing.owner_full_name}
            {ownerRating && ownerRating.review_count > 0 && (
              <span className="ml-2 text-xs text-muted-foreground">
                (⭐ {ownerRating.average_rating} · {ownerRating.review_count}{" "}
                {ownerRating.review_count === 1 ? "αξιολόγηση" : "αξιολογήσεις"})
              </span>
            )}
          </p>

          {isOwner && (
            <div className="mt-2 flex flex-col gap-2 rounded-md bg-secondary p-2 text-secondary-foreground">
              <p>Αυτή είναι δική σου αγγελία.</p>
              {listing.status === "active" && (
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => handleStatusChange("completed")} disabled={isUpdatingStatus}>
                    Ολοκληρώθηκε
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStatusChange("withdrawn")}
                    disabled={isUpdatingStatus}
                  >
                    Απόσυρση
                  </Button>
                </div>
              )}
              {statusError && <p className="text-sm text-destructive">{statusError}</p>}
            </div>
          )}

          {!user && listing.status === "active" && (
            <p className="mt-2 text-muted-foreground">
              <Link to="/login" className="underline">
                Συνδέσου
              </Link>{" "}
              για να υποβάλεις πρόταση.
            </p>
          )}

          {canPropose && (
            <div className="mt-4 flex flex-col gap-3 border-t pt-4">
              {listing.type === "exchange" && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium">Ποιο δικό σου βιβλίο προσφέρεις;</label>
                  {myBooks.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Δεν έχεις ενεργές αγγελίες τύπου ανταλλαγής να προσφέρεις.{" "}
                      <Link to="/listings/new" className="underline">
                        Φτιάξε μία πρώτα.
                      </Link>
                    </p>
                  ) : (
                    <select
                      className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                      value={selectedBookId}
                      onChange={(e) => setSelectedBookId(e.target.value)}
                    >
                      <option value="">— Διάλεξε βιβλίο —</option>
                      {myBooks.map((book) => (
                        <option key={book.id} value={book.id}>
                          {book.title}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              {proposalError && <p className="text-sm text-destructive">{proposalError}</p>}

              <Button onClick={handleSubmitProposal} disabled={isSubmittingProposal}>
                {isSubmittingProposal
                  ? "Υποβολή..."
                  : listing.type === "exchange"
                    ? "Υποβολή Πρότασης Ανταλλαγής"
                    : listing.type === "sale"
                      ? "Αίτημα Αγοράς"
                      : "Αίτημα Παραλαβής"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
