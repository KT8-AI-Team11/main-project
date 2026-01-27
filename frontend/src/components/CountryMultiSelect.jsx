import React, { useMemo, useState } from "react";
import { ChevronDown, X, Check } from "lucide-react";

/**
 * CountryMultiSelect
 * - 멀티 선택 드롭다운
 * - 검색
 * - 선택 칩(최대 2개) + 초과는 +N
 * - 해제 / 완료
 *
 * 사용 예:
 * <CountryMultiSelect
 *   label="대상 국가 선택"
 *   options={[{code:"US",name:"미국"}, ...]}
 *   value={selectedCountries}
 *   onChange={setSelectedCountries}
 * />
 */
export default function CountryMultiSelect({
  label = "국가 선택",
  options = [],
  value = [],
  onChange,
  placeholder = "국가를 선택하세요",
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  const selected = useMemo(
    () => options.filter((o) => value.includes(o.code)),
    [options, value]
  );

  const filtered = useMemo(() => {
    const t = q.trim();
    if (!t) return options;
    return options.filter(
      (o) =>
        o.name.includes(t) ||
        o.code.toLowerCase().includes(t.toLowerCase())
    );
  }, [options, q]);

  const toggle = (code) => {
    if (!onChange) return;
    const next = value.includes(code)
      ? value.filter((c) => c !== code)
      : [...value, code];
    onChange(next);
  };

  const clear = () => onChange?.([]);

  const close = () => {
    setOpen(false);
    setQ("");
  };

  return (
    <div style={{ position: "relative" }}>
      {/* Label */}
      <div style={{ fontSize: 12, fontWeight: 900, color: "#111827", marginBottom: 8 }}>
        {label}
      </div>

      {/* Anchor */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          width: "100%",
          minHeight: 44,
          borderRadius: 12,
          border: "1px solid #e5e7eb",
          backgroundColor: "white",
          cursor: "pointer",
          padding: "8px 10px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          {selected.length === 0 ? (
            <span style={{ fontSize: 13, color: "#9ca3af", fontWeight: 800 }}>
              {placeholder}
            </span>
          ) : (
            <>
              {selected.slice(0, 2).map((s) => (
                <span
                  key={s.code}
                  style={{
                    padding: "6px 10px",
                    borderRadius: 999,
                    backgroundColor: "#eff6ff",
                    border: "1px solid #bfdbfe",
                    color: "#1d4ed8",
                    fontWeight: 900,
                    fontSize: 12,
                  }}
                >
                  {s.name}
                </span>
              ))}
              {selected.length > 2 && (
                <span style={{ fontSize: 12, fontWeight: 900, color: "#6b7280" }}>
                  +{selected.length - 2}
                </span>
              )}
            </>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {selected.length > 0 && (
            <span
              style={{
                fontSize: 12,
                fontWeight: 900,
                color: "#111827",
                backgroundColor: "#f3f4f6",
                border: "1px solid #e5e7eb",
                padding: "4px 8px",
                borderRadius: 999,
              }}
            >
              {selected.length}개
            </span>
          )}
          <ChevronDown size={18} color="#6b7280" />
        </div>
      </button>

      {/* Popover */}
      {open && (
        <>
          {/* overlay */}
          <div
            onClick={close}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 2000,
              background: "transparent",
            }}
          />

          {/* panel */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "absolute",
              zIndex: 3000,
              top: 52,
              left: 0,
              right: 0,
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: 14,
              boxShadow: "0 20px 25px -5px rgba(0,0,0,0.12)",
              overflow: "hidden",
            }}
          >
            <div style={{ padding: 12, borderBottom: "1px solid #f3f4f6" }}>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="검색"
                  style={{
                    flex: 1,
                    height: 38,
                    borderRadius: 12,
                    border: "1px solid #e5e7eb",
                    padding: "0 10px",
                    fontSize: 13,
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />

                <button
                  type="button"
                  onClick={clear}
                  style={{
                    height: 38,
                    padding: "0 10px",
                    borderRadius: 12,
                    border: "1px solid #e5e7eb",
                    backgroundColor: "white",
                    cursor: "pointer",
                    fontWeight: 900,
                    fontSize: 12,
                    color: "#111827",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                  title="선택 해제"
                >
                  <X size={14} /> 해제
                </button>
              </div>
            </div>

            <div style={{ maxHeight: 240, overflowY: "auto", padding: 8 }}>
              {filtered.length === 0 ? (
                <div style={{ padding: 12, fontSize: 13, color: "#9ca3af", fontWeight: 800 }}>
                  검색 결과가 없습니다.
                </div>
              ) : (
                filtered.map((c) => {
                  const active = value.includes(c.code);
                  return (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => toggle(c.code)}
                      style={{
                        width: "100%",
                        textAlign: "left",
                        border: "none",
                        backgroundColor: active ? "#eff6ff" : "white",
                        cursor: "pointer",
                        borderRadius: 12,
                        padding: "10px 10px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 10,
                      }}
                    >
                      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <span style={{ fontSize: 13, fontWeight: 900, color: "#111827" }}>
                          {c.name}
                        </span>
                        <span style={{ fontSize: 11, color: "#9ca3af", fontWeight: 900 }}>
                          {c.code}
                        </span>
                      </div>

                      <span
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: 8,
                          border: `2px solid ${active ? "#3b82f6" : "#d1d5db"}`,
                          backgroundColor: active ? "#3b82f6" : "transparent",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {active && <Check size={14} color="white" />}
                      </span>
                    </button>
                  );
                })
              )}
            </div>

            <div
              style={{
                padding: 10,
                borderTop: "1px solid #f3f4f6",
                display: "flex",
                justifyContent: "flex-end",
                gap: 8,
              }}
            >
              <button
                type="button"
                onClick={close}
                style={{
                  height: 38,
                  padding: "0 12px",
                  borderRadius: 12,
                  border: "none",
                  backgroundColor: "#111827",
                  color: "white",
                  cursor: "pointer",
                  fontWeight: 900,
                  fontSize: 12,
                }}
              >
                완료
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
