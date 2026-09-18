import { useEffect, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";

export default function StatsSection() {
  const [stats, setStats] = useState([]);

  useEffect(() => {
    api.get("/admin/stats/demand").then(setStats);
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Στατιστικά Ζήτησης ανά Μάθημα</CardTitle>
      </CardHeader>
      <CardContent>
        {stats.length === 0 ? (
          <p className="text-sm text-muted-foreground">Δεν υπάρχουν μαθήματα ακόμα.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="py-2 pr-4">Μάθημα</th>
                  <th className="py-2 pr-4">Λίστες επιθυμιών</th>
                  <th className="py-2 pr-4">Ενεργές αγγελίες</th>
                  <th className="py-2 pr-4">Σύνολο αγγελιών</th>
                  <th className="py-2">Προτάσεις</th>
                </tr>
              </thead>
              <tbody>
                {stats.map((row) => (
                  <tr key={row.course_id} className="border-b">
                    <td className="py-2 pr-4">{row.course_name}</td>
                    <td className="py-2 pr-4">{row.wishlist_count}</td>
                    <td className="py-2 pr-4">{row.active_listing_count}</td>
                    <td className="py-2 pr-4">{row.total_listing_count}</td>
                    <td className="py-2">{row.proposal_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
