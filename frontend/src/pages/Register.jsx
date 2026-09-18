import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      await register({ institutionalEmail: email, password, fullName });
      navigate("/login");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm p-4 sm:p-8">
      <Card>
        <CardHeader>
          <CardTitle>Εγγραφή</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="fullName">Ονοματεπώνυμο</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Ιδρυματικό email</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@unipi.gr"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Κωδικός</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? "Απόκρυψη κωδικού" : "Εμφάνιση κωδικού"}
                  title={showPassword ? "Απόκρυψη κωδικού" : "Εμφάνιση κωδικού"}
                >
                  <svg
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="h-5 w-5"
                  >
                    {showPassword ? (
                      <>
                        <path d="M2.06 12.35a1 1 0 0 1 0-.7C3.62 7.6 7.52 5 12 5c4.48 0 8.38 2.6 9.94 6.65a1 1 0 0 1 0 .7C20.38 16.4 16.48 19 12 19c-4.48 0-8.38-2.6-9.94-6.65Z" />
                        <circle cx="12" cy="12" r="3" />
                      </>
                    ) : (
                      <>
                        <path d="m3 3 18 18" />
                        <path d="M10.58 10.58a2 2 0 0 0 2.83 2.83" />
                        <path d="M9.88 5.09A10.94 10.94 0 0 1 12 5c4.48 0 8.38 2.6 9.94 6.65a1 1 0 0 1 0 .7 10.96 10.96 0 0 1-4.1 4.88" />
                        <path d="M6.61 6.61a10.96 10.96 0 0 0-4.55 5.04 1 1 0 0 0 0 .7C3.62 16.4 7.52 19 12 19c1.61 0 3.13-.34 4.49-.94" />
                      </>
                    )}
                  </svg>
                </button>
              </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Εγγραφή..." : "Εγγραφή"}
            </Button>
          </form>

          <p className="mt-4 text-sm text-muted-foreground">
            Έχεις ήδη λογαριασμό;{" "}
            <Link to="/login" className="underline">
              Σύνδεση
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
