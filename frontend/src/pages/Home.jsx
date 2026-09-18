import { Link } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const { user, isLoading } = useAuth();

  return (
    <div className="mx-auto max-w-2xl p-4 sm:p-8">
      <Card>
        <CardHeader>
          <CardTitle>ReBook — Ανταλλαγή Βιβλίων μεταξύ Φοιτητών</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">Φόρτωση...</p>
          ) : user ? (
            <p>
              Συνδεδεμένος ως <strong>{user.full_name}</strong> ({user.institutional_email})
            </p>
          ) : (
            <p className="text-muted-foreground">
              Δεν είσαι συνδεδεμένος.{" "}
              <Link to="/login" className="underline">
                Σύνδεση
              </Link>{" "}
              ή{" "}
              <Link to="/register" className="underline">
                Εγγραφή
              </Link>
              .
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
