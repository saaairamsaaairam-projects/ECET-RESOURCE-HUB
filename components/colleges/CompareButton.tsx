"use client";

import { useCompareColleges } from "@/context/CompareCollegesContext";

interface CompareButtonProps {
  collegeId: string;
  label?: string;
}

export default function CompareButton({ collegeId, label = "Compare" }: CompareButtonProps) {
  const { selectedColleges, addCollege, removeCollege } = useCompareColleges();
  const isSelected = selectedColleges.includes(collegeId);
  const isDisabled = selectedColleges.length >= 2 && !isSelected;

  const handleClick = () => {
    if (isSelected) {
      removeCollege(collegeId);
      return;
    }

    if (!isDisabled) {
      addCollege(collegeId);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isDisabled}
      className={`inline-flex items-center justify-center rounded-xl border px-4 py-2 text-sm font-semibold transition ${
        isSelected
          ? "border-emerald-400/60 bg-emerald-500/10 text-emerald-100"
          : isDisabled
            ? "cursor-not-allowed border-white/10 bg-white/5 text-gray-400"
            : "border-purple-400/40 bg-purple-500/10 text-purple-100 hover:bg-purple-500/20"
      }`}
    >
      {isSelected ? "Selected" : label}
    </button>
  );
}
