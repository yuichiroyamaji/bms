import EngineersTableJa from "@/features/engineers/components/EngineersTableJa";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "エンジニアダッシュボード | TailAdmin - Next.js Dashboard Template",
  description:
    "チームメンバー、スキル、プロジェクト、タイムライン割り当てを表示するエンジニアダッシュボードページ - TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
};

export default function EngineersPageJa() {
  return (
    <div>
      <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
        オフショア･エンジニア ダッシュボード
      </h3>
      <div className="space-y-6">
        <EngineersTableJa />
      </div>
    </div>
  );
}

