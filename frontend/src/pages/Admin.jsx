import { useState } from "react";

import CatalogSection from "@/components/admin/CatalogSection";
import ReportsSection from "@/components/admin/ReportsSection";
import StatsSection from "@/components/admin/StatsSection";
import UsersSection from "@/components/admin/UsersSection";
import { Button } from "@/components/ui/button";

const TABS = [
  { id: "catalog", label: "Κατάλογος Μαθημάτων", Component: CatalogSection },
  { id: "reports", label: "Αναφορές", Component: ReportsSection },
  { id: "users", label: "Χρήστες", Component: UsersSection },
  { id: "stats", label: "Στατιστικά", Component: StatsSection },
];

export default function Admin() {
  const [activeTab, setActiveTab] = useState("catalog");
  const ActiveComponent = TABS.find((tab) => tab.id === activeTab).Component;

  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-8">
      <h1 className="mb-6 text-2xl font-semibold">Διαχείριση</h1>

      <div className="mb-6 flex flex-wrap gap-2 border-b pb-2">
        {TABS.map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      <ActiveComponent />
    </div>
  );
}
