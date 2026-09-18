import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { api } from "@/lib/api";

export default function CatalogSection() {
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState("");

  const [newDepartmentName, setNewDepartmentName] = useState("");
  const [newCourseName, setNewCourseName] = useState("");
  const [newCourseDepartmentId, setNewCourseDepartmentId] = useState("");

  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [suggestedBooks, setSuggestedBooks] = useState([]);
  const [newBookTitle, setNewBookTitle] = useState("");
  const [newBookIsbn, setNewBookIsbn] = useState("");

  async function loadAll() {
    const [departmentsData, coursesData] = await Promise.all([api.get("/departments"), api.get("/courses")]);
    setDepartments(departmentsData);
    setCourses(coursesData);
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function handleAddDepartment(event) {
    event.preventDefault();
    setError("");
    try {
      await api.post("/admin/departments", { name: newDepartmentName });
      setNewDepartmentName("");
      await loadAll();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDeleteDepartment(id) {
    try {
      await api.delete(`/admin/departments/${id}`);
      await loadAll();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleAddCourse(event) {
    event.preventDefault();
    setError("");
    try {
      await api.post("/admin/courses", { name: newCourseName, department_id: Number(newCourseDepartmentId) });
      setNewCourseName("");
      setNewCourseDepartmentId("");
      await loadAll();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDeleteCourse(id) {
    try {
      await api.delete(`/admin/courses/${id}`);
      if (selectedCourseId === id) setSelectedCourseId(null);
      await loadAll();
    } catch (err) {
      setError(err.message);
    }
  }

  async function openSuggestedBooks(courseId) {
    setSelectedCourseId(courseId);
    const books = await api.get(`/courses/${courseId}/suggested-books`);
    setSuggestedBooks(books);
  }

  async function handleAddSuggestedBook(event) {
    event.preventDefault();
    setError("");
    try {
      await api.post("/admin/suggested-books", {
        title: newBookTitle,
        isbn: newBookIsbn || null,
        course_id: selectedCourseId,
      });
      setNewBookTitle("");
      setNewBookIsbn("");
      await openSuggestedBooks(selectedCourseId);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDeleteSuggestedBook(id) {
    try {
      await api.delete(`/admin/suggested-books/${id}`);
      await openSuggestedBooks(selectedCourseId);
    } catch (err) {
      setError(err.message);
    }
  }

  function departmentName(id) {
    return departments.find((d) => d.id === id)?.name;
  }

  return (
    <div className="flex flex-col gap-6">
      {error && <p className="text-sm text-destructive">{error}</p>}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Τμήματα</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <form onSubmit={handleAddDepartment} className="flex flex-wrap gap-2">
            <Input
              placeholder="Νέο τμήμα"
              value={newDepartmentName}
              onChange={(e) => setNewDepartmentName(e.target.value)}
              required
            />
            <Button type="submit">Προσθήκη</Button>
          </form>
          <ul className="flex flex-col gap-1 text-sm">
            {departments.map((department) => (
              <li key={department.id} className="flex flex-wrap items-center justify-between gap-2">
                <span>{department.name}</span>
                <Button variant="outline" size="sm" onClick={() => handleDeleteDepartment(department.id)}>
                  Διαγραφή
                </Button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Μαθήματα</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <form onSubmit={handleAddCourse} className="flex flex-wrap gap-2">
            <Input
              placeholder="Νέο μάθημα"
              value={newCourseName}
              onChange={(e) => setNewCourseName(e.target.value)}
              required
            />
            <Select
              value={newCourseDepartmentId}
              onChange={(e) => setNewCourseDepartmentId(e.target.value)}
              required
            >
              <option value="">— Τμήμα —</option>
              {departments.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </Select>
            <Button type="submit">Προσθήκη</Button>
          </form>

          <ul className="flex flex-col gap-1 text-sm">
            {courses.map((course) => (
              <li key={course.id} className="flex flex-wrap items-center justify-between gap-2">
                <button className="underline" onClick={() => openSuggestedBooks(course.id)}>
                  {course.name} <span className="text-muted-foreground">({departmentName(course.department_id)})</span>
                </button>
                <Button variant="outline" size="sm" onClick={() => handleDeleteCourse(course.id)}>
                  Διαγραφή
                </Button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {selectedCourseId && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Προτεινόμενα Βιβλία — {courses.find((c) => c.id === selectedCourseId)?.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <form onSubmit={handleAddSuggestedBook} className="flex flex-wrap gap-2">
              <Input
                placeholder="Τίτλος"
                value={newBookTitle}
                onChange={(e) => setNewBookTitle(e.target.value)}
                required
              />
              <Input placeholder="ISBN (προαιρετικό)" value={newBookIsbn} onChange={(e) => setNewBookIsbn(e.target.value)} />
              <Button type="submit">Προσθήκη</Button>
            </form>
            <ul className="flex flex-col gap-1 text-sm">
              {suggestedBooks.length === 0 ? (
                <li className="text-muted-foreground">Κανένα βιβλίο ακόμα.</li>
              ) : (
                suggestedBooks.map((book) => (
                  <li key={book.id} className="flex flex-wrap items-center justify-between gap-2">
                    <span>
                      {book.title} {book.isbn && <span className="text-muted-foreground">({book.isbn})</span>}
                    </span>
                    <Button variant="outline" size="sm" onClick={() => handleDeleteSuggestedBook(book.id)}>
                      Διαγραφή
                    </Button>
                  </li>
                ))
              )}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
