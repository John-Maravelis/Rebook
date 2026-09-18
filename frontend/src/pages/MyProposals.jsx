import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import { TYPE_LABELS } from "@/lib/constants";

const STATUS_LABELS = {
  pending: "Εκκρεμεί",
  accepted: "Αποδεκτή",
  rejected: "Απορρίφθηκε",
};

export default function MyProposals() {
  const [proposals, setProposals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api
      .get("/proposals/mine")
      .then(setProposals)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <p className="p-4 sm:p-8 text-muted-foreground">Φόρτωση...</p>;

  return (
    <div className="mx-auto max-w-2xl p-4 sm:p-8">
      <h1 className="mb-6 text-2xl font-semibold">Οι Προτάσεις Μου</h1>
      {proposals.length === 0 ? (
        <p className="text-muted-foreground">Δεν έχεις υποβάλει καμία πρόταση ακόμα.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {proposals.map((proposal) => (
            <Link key={proposal.id} to={`/proposals/${proposal.id}`}>
              <Card className="transition-colors hover:bg-accent">
                <CardHeader>
                  <CardTitle className="text-base">{proposal.listing_title}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-1 text-sm text-muted-foreground">
                  <span>Προς: {proposal.listing_owner_full_name}</span>
                  <span>
                    {TYPE_LABELS[proposal.type]} — {STATUS_LABELS[proposal.status]}
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
