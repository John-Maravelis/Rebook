import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { api } from "@/lib/api";
import { CONDITION_LABELS, TYPE_LABELS } from "@/lib/constants";

export default function CreateListing() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);

  const [title, setTitle] = useState("");
  const [isbn, setIsbn] = useState("");
  const [edition, setEdition] = useState("");
  const [condition, setCondition] = useState("good");
  const [type, setType] = useState("exchange");
  const [price, setPrice] = useState("");
  const [courseId, setCourseId] = useState("");
  const [suggestedBooks, setSuggestedBooks] = useState([]);
  const [photo, setPhoto] = useState(null);

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    api.get("/courses").then(setCourses).catch(() => setCourses([]));
  }, []);

  // Δείχνουμε τα προτεινόμενα βιβλία του μαθήματος σαν βοήθημα για σωστό τίτλο/ISBN.
  useEffect(() => {
    if (!courseId) {
      setSuggestedBooks([]);
      return;
    }
    api
      .get(`/courses/${courseId}/suggested-books`)
      .then(setSuggestedBooks)
      .catch(() => setSuggestedBooks([]));
  }, [courseId]);

  function applySuggestedBook(book) {
    setTitle(book.title);
    if (book.isbn) setIsbn(book.isbn);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const payload = {
        title,
        isbn: isbn || null,
        edition: edition || null,
        condition,
        type,
        price: type === "sale" ? Number(price) : null,
        course_id: courseId || null,
      };
      if (photo) {
        const uploadedPhoto = await api.uploadPhoto(photo);
        payload.photo_url = uploadedPhoto.url;
      }
      const created = await api.post("/listings", payload);
      navigate(`/listings/${created.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg p-4 sm:p-8">
      <Card>
        <CardHeader>
          <CardTitle>Νέα Αγγελία</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="title">Τίτλος</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="isbn">ISBN (προαιρετικό)</Label>
              <Input id="isbn" value={isbn} onChange={(e) => setIsbn(e.target.value)} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edition">Έκδοση (προαιρετικό)</Label>
              <Input id="edition" value={edition} onChange={(e) => setEdition(e.target.value)} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="condition">Κατάσταση βιβλίου</Label>
              <Select id="condition" value={condition} onChange={(e) => setCondition(e.target.value)}>
                {Object.entries(CONDITION_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="type">Τύπος διάθεσης</Label>
              <Select id="type" value={type} onChange={(e) => setType(e.target.value)}>
                {Object.entries(TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </div>

            {type === "sale" && (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="price">Τιμή (€)</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="photo">Φωτογραφία βιβλίου (προαιρετική)</Label>
              <Input
                id="photo"
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                onChange={(event) => setPhoto(event.target.files?.[0] || null)}
              />
              <p className="text-xs text-muted-foreground">JPG, PNG ή WEBP έως 5 MB.</p>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="course">Μάθημα (προαιρετικό)</Label>
              <Select id="course" value={courseId} onChange={(e) => setCourseId(e.target.value)}>
                <option value="">— Κανένα —</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
              </Select>
              {suggestedBooks.length > 0 && (
                <div className="mt-1 flex flex-col gap-1 rounded-md bg-secondary p-2 text-sm text-secondary-foreground">
                  <span className="font-medium">Προτεινόμενα συγγράμματα για το μάθημα:</span>
                  {suggestedBooks.map((book) => (
                    <button
                      type="button"
                      key={book.id}
                      onClick={() => applySuggestedBook(book)}
                      className="text-left underline"
                    >
                      {book.title} {book.isbn && `(${book.isbn})`}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Δημιουργία..." : "Δημιουργία Αγγελίας"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
