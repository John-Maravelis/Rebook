import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";

const REPORT_STATUS_LABELS = {
  open: "Ανοιχτή",
  resolved: "Επιλυμένη",
};

export default function ReportsSection() {
  const [reports, setReports] = useState([]);
  const [error, setError] = useState("");

  async function loadReports() {
    const data = await api.get("/admin/reports");
    setReports(data);
  }

  useEffect(() => {
    loadReports();
  }, []);

  async function handleResolve(id) {
    try {
      await api.patch(`/admin/reports/${id}/resolve`);
      await loadReports();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleBlockUser(userId) {
    try {
      await api.patch(`/admin/users/${userId}/block`);
      await loadReports();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Αναφορές Κατάχρησης</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {error && <p className="text-sm text-destructive">{error}</p>}
        {reports.length === 0 ? (
          <p className="text-sm text-muted-foreground">Καμία αναφορά ακόμα.</p>
        ) : (
          reports.map((report) => (
            <div key={report.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-3 text-sm">
              <div>
                <p>
                  Χρήστης #{report.reporter_id} ανέφερε τον χρήστη #{report.reported_user_id}
                </p>
                <p className="text-muted-foreground">{report.reason}</p>
                <p className="text-muted-foreground">{REPORT_STATUS_LABELS[report.status]}</p>
              </div>
              <div className="flex gap-2">
                {report.status === "open" && (
                  <Button variant="outline" size="sm" onClick={() => handleResolve(report.id)}>
                    Επίλυση
                  </Button>
                )}
                <Button variant="destructive" size="sm" onClick={() => handleBlockUser(report.reported_user_id)}>
                  Αποκλεισμός
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
