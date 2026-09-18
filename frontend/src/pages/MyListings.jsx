import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { STATUS_LABELS, TYPE_LABELS } from "@/lib/constants";

export default function MyListings() {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [proposalsByListing, setProposalsByListing] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const myListings = await api.get(`/listings?owner_id=${user.id}`);
      setListings(myListings);

      const entries = await Promise.all(
        myListings.map(async (listing) => [listing.id, await api.get(`/listings/${listing.id}/proposals`)]),
      );
      setProposalsByListing(Object.fromEntries(entries));
      setIsLoading(false);
    }
    load();
  }, [user.id]);

  if (isLoading) return <p className="p-4 sm:p-8 text-muted-foreground">Φόρτωση...</p>;

  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-8">
      <h1 className="mb-6 text-2xl font-semibold">Οι Αγγελίες Μου</h1>
      {listings.length === 0 ? (
        <p className="text-muted-foreground">Δεν έχεις καταχωρήσει καμία αγγελία ακόμα.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {listings.map((listing) => {
            const proposals = proposalsByListing[listing.id] || [];
            return (
              <Card key={listing.id}>
                <CardHeader>
                  <CardTitle className="text-base">
                    <Link to={`/listings/${listing.id}`} className="underline">
                      {listing.title}
                    </Link>{" "}
                    <span className="text-sm font-normal text-muted-foreground">
                      ({TYPE_LABELS[listing.type]} — {STATUS_LABELS[listing.status]})
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {proposals.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Καμία πρόταση ακόμα.</p>
                  ) : (
                    <ul className="flex flex-col gap-1 text-sm">
                      {proposals.map((proposal) => (
                        <li key={proposal.id}>
                          <Link to={`/proposals/${proposal.id}`} className="underline">
                            {proposal.requester_full_name} — {proposal.status}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
