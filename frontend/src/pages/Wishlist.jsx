import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { api } from "@/lib/api";

export default function Wishlist() {
  const [items, setItems] = useState([]);
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [courseId, setCourseId] = useState("");
  const [title, setTitle] = useState("");
  const [isbn, setIsbn] = useState("");

  async function loadItems() {
    setIsLoading(true);
    try {
      const [wishlistItems, coursesData] = await Promise.all([api.get("/wishlist"), api.get("/courses")]);
      setItems(wishlistItems);
      setCourses(coursesData);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadItems();
  }, []);

  async function handleAdd(event) {
    event.preventDefault();
    setError("");
    try {
      await api.post("/wishlist", {
        course_id: courseId || null,
        title: title || null,
        isbn: isbn || null,
      });
      setCourseId("");
      setTitle("");
      setIsbn("");
      await loadItems();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(itemId) {
    try {
      await api.delete(`/wishlist/${itemId}`);
      setItems((prev) => prev.filter((item) => item.id !== itemId));
    } catch (err) {
      setError(err.message);
    }
  }

  function courseName(courseId) {
    return courses.find((c) => c.id === courseId)?.name;
  }

  return (
    <div className="mx-auto max-w-2xl p-4 sm:p-8">
      <h1 className="mb-6 text-2xl font-semibold">Λίστα Επιθυμιών</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Νέα καταχώρηση</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="wishlist-course">Μάθημα</Label>
              <Select id="wishlist-course" value={courseId} onChange={(e) => setCourseId(e.target.value)}>
                <option value="">— Κανένα —</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="wishlist-title">Τίτλος</Label>
              <Input id="wishlist-title" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="wishlist-isbn">ISBN</Label>
              <Input id="wishlist-isbn" value={isbn} onChange={(e) => setIsbn(e.target.value)} />
            </div>
            <p className="col-span-full text-xs text-muted-foreground">
              Συμπλήρωσε τουλάχιστον ένα από τα τρία — θα ειδοποιηθείς όταν καταχωρηθεί αγγελία που ταιριάζει.
            </p>
            {error && <p className="col-span-full text-sm text-destructive">{error}</p>}
            <Button type="submit" className="col-span-full sm:w-fit">
              Προσθήκη
            </Button>
          </form>
        </CardContent>
      </Card>

      {isLoading ? (
        <p className="text-muted-foreground">Φόρτωση...</p>
      ) : items.length === 0 ? (
        <p className="text-muted-foreground">Η λίστα επιθυμιών σου είναι άδεια.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((item) => (
            <Card key={item.id} className="flex flex-row items-center justify-between p-4">
              <div className="text-sm">
                {item.course_id && <span>Μάθημα: {courseName(item.course_id) || item.course_id}</span>}
                {item.title && <span>Τίτλος: {item.title}</span>}
                {item.isbn && <span>ISBN: {item.isbn}</span>}
              </div>
              <Button variant="outline" size="sm" onClick={() => handleDelete(item.id)}>
                Διαγραφή
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
