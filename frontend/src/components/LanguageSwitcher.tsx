import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";

const languages = [
  { code: "en", label: "English", display: "EN" },
  { code: "fr", label: "Fran\u00e7ais", display: "FR" },
  { code: "es", label: "Espa\u00f1ol", display: "ES" },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const currentLang =
    languages.find((l) => i18n.language?.startsWith(l.code))?.display ?? "EN";

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const switchLanguage = (code: string) => {
    i18n.changeLanguage(code);
    localStorage.setItem("i18nextLng", code);
    document.documentElement.lang = code;
    setOpen(false);
  };

  return (
    <div ref={ref} style={{ position: "relative", fontFamily: "var(--font-m)" }}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        style={{
          height: 32,
          padding: "0 10px",
          borderRadius: 6,
          border: "1px solid var(--border)",
          background: "var(--glass)",
          color: "var(--text-mid)",
          fontSize: 11,
          fontFamily: "var(--font-m)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 4,
        }}
      >
        {currentLang}
        <span style={{ fontSize: 9, opacity: 0.6 }}>{open ? "\u25B2" : "\u25BC"}</span>
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            right: 0,
            minWidth: 110,
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 6,
            overflow: "hidden",
            zIndex: 999,
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
        >
          {languages.map((lang) => {
            const isActive = i18n.language?.startsWith(lang.code);
            const isHovered = hovered === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => switchLanguage(lang.code)}
                onMouseEnter={() => setHovered(lang.code)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  display: "block",
                  width: "100%",
                  padding: "7px 12px",
                  border: "none",
                  background: isHovered
                    ? "var(--glass)"
                    : "transparent",
                  color: isActive ? "var(--accent)" : "var(--text-dim)",
                  fontSize: 11,
                  fontFamily: "var(--font-m)",
                  cursor: "pointer",
                  textAlign: "left",
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                {lang.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
