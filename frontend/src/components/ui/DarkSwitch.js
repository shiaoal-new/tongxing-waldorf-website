import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Icon } from "@iconify/react";
import { themes } from "../../lib/brand-config";

export const ThemeList = ({ onItemClick }) => {
  const { theme, setTheme } = useTheme();
  return (
    <>
      <li className="menu-title text-brand-accent px-4 py-2 text-xs font-bold uppercase tracking-wider">選擇主題 (Themes)</li>
      <div className="max-h-60 overflow-y-auto mb-2">
        {themes.map((t) => (
          <li key={t}>
            <a
              className={`flex justify-between items-center ${theme === t ? "active bg-brand-accent text-brand-bg" : "text-brand-text dark:text-brand-bg"}`}
              onClick={(e) => {
                e.preventDefault();
                setTheme(t);
                if (onItemClick) onItemClick();
              }}
            >
              <span className="capitalize">{t}</span>
              {theme === t && <Icon icon="lucide:check" className="w-4 h-4 ml-2" />}
            </a>
          </li>
        ))}
      </div>
    </>
  );
};

const ThemeChanger = () => {
  const [mounted, setMounted] = useState(false);

  // When mounted on client, now we can show the UI
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <div className="dropdown dropdown-end">
      <div tabIndex={0} role="Button" className="btn btn-ghost btn-circle text-brand-taupe">
        <Icon icon="lucide:palette" className="w-5 h-5" />
      </div>
      <ul tabIndex={0} className="dropdown-content z-[100] menu p-1 shadow-2xl bg-brand-bg dark:bg-brand-structural rounded-box w-52 mt-4 border border-brand-taupe/10">
        <ThemeList />
      </ul>
    </div>
  );
};

export default ThemeChanger;
