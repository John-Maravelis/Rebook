import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { api } from "@/lib/api";
import { CONDITION_LABELS, TYPE_LABELS } from "@/lib/constants";

export default function Listings() {
  const [listings, setListings] = useState([]);
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [type, setType] = useState("");
  const [condition, setCondition] = useState("");
  const [courseId, setCourseId] = useState("");

  useEffect(() => {
    api.get("/courses").then(setCourses).catch(() => setCourses([]));
  }, []);

  async function runSearch(event) {
    event?.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      params.set("status_filter", "active");
      if (title) params.set("title", title);
      if (type) params.set("type", type);
      if (condition) params.set("condition", condition);
      if (courseId) params.set("course_id", courseId);

      const results = await api.get(`/listings?${params.toString()}`);
      setListings(results);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    runSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold">Αγγελίες</h1>
        <Link to="/listings/new">
          <Button>+ Νέα Αγγελία</Button>
        </Link>
      </div>

      <form onSubmit={runSearch} className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="search-title">Τίτλος</Label>
          <Input id="search-title" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="search-type">Τύπος</Label>
          <Select id="search-type" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">Όλοι</option>
            {Object.entries(TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="search-condition">Κατάσταση</Label>
          <Select id="search-condition" value={condition} onChange={(e) => setCondition(e.target.value)}>
            <option value="">Όλες</option>
            {Object.entries(CONDITION_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="search-course">Μάθημα</Label>
          <Select id="search-course" value={courseId} onChange={(e) => setCourseId(e.target.value)}>
            <option value="">Όλα</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="col-span-2 sm:col-span-4">
          <Button type="submit">Αναζήτηση</Button>
        </div>
      </form>

      {error && <p className="text-sm text-destructive">{error}</p>}
      {isLoading ? (
        <p className="text-muted-foreground">Φόρτωση...</p>
      ) : listings.length === 0 ? (
        <p className="text-muted-foreground">Δεν βρέθηκαν αγγελίες.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {listings.map((listing) => (
            <Link key={listing.id} to={`/listings/${listing.id}`}>
              <Card className="h-full transition-colors hover:bg-accent">
                <CardHeader>
                  <CardTitle className="text-base">{listing.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-1 text-sm text-muted-foreground">
                  <span>{TYPE_LABELS[listing.type]}</span>
                  <span>{CONDITION_LABELS[listing.condition]}</span>
                  {listing.type === "sale" && listing.price != null && <span>{listing.price} €</span>}
                  <span>Από: {listing.owner_full_name}</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
