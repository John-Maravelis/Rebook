import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";

export default function UsersSection() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  async function loadUsers() {
    const data = await api.get("/admin/users");
    setUsers(data);
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function handleToggleBlock(user) {
    try {
      const action = user.is_blocked ? "unblock" : "block";
      await api.patch(`/admin/users/${user.id}/${action}`);
      await loadUsers();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Χρήστες</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {error && <p className="text-sm text-destructive">{error}</p>}
        {users.map((user) => (
          <div key={user.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-2 text-sm">
            <div>
              <p>
                #{user.id} — {user.full_name} ({user.institutional_email})
              </p>
              <p className="text-muted-foreground">
                {user.role} {user.is_blocked && "— Αποκλεισμένος"}
              </p>
            </div>
            <Button
              variant={user.is_blocked ? "outline" : "destructive"}
              size="sm"
              onClick={() => handleToggleBlock(user)}
            >
              {user.is_blocked ? "Άρση αποκλεισμού" : "Αποκλεισμός"}
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
