import EngineersTable from "@/features/engineers/components/EngineersTable";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Engineers Dashboard | TailAdmin - Next.js Dashboard Template",
  description:
    "Engineers Dashboard page showing team members, skills, projects, and timeline assignments for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
};

export default function EngineersPage() {
  return (
    <div>
      <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
        Engineers Dashboard
      </h3>
      <div className="space-y-6">
        <EngineersTable />
      </div>
    </div>
  );
}