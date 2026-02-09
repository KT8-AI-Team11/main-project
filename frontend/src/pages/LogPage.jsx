import React, { useEffect, useState, useMemo } from "react";
import { Search, FileText, RefreshCw, Loader2 } from "lucide-react";
import { apiFetch } from "../api/client";

const SEVERITY_META = {
    HIGH: { bg: "#FEE2E2", fg: "#991B1B", bd: "#FCA5A5" },
    MEDIUM: { bg: "#FEF3C7", fg: "#92400E", bd: "#FCD34D" },
    LOW: { bg: "#DCFCE7", fg: "#166534", bd: "#86EFAC" },
};

const SeverityPill = ({ value }) => {
    const sev = String(value || "").toUpperCase();
    const meta = SEVERITY_META[sev] || { bg: "#F3F4F6", fg: "#374151", bd: "#E5E7EB" };
    return (
        <span className="cosy-chip" style={{
            background: meta.bg, color: meta.fg, border: `1px solid ${meta.bd}`,
            fontWeight: 800, padding: "2px 8px", borderRadius: "6px", fontSize: "11px"
        }}>{sev || "UNKNOWN"}</span>
    );
};

const COUNTRY_META = {
    US: { bg: "#EFF6FF", fg: "#3B82F6", bd: "#8B5CF6" },
    JP: { bg: "#FDF2F8", fg: "#F59E0B", bd: "#F59E0B" },
    CN: { bg: "#FEF2F2", fg: "#EF4444", bd: "#EF4444" },
    EU: { bg: "#edeaea", fg: "#8B5CF6", bd: "#8B5CF6" },
};

const CountryPill = ({ value }) => {
    const sev = String(value || "").toUpperCase();
    const meta = COUNTRY_META[sev] || { bg: "#F3F4F6", fg: "#374151", bd: "#E5E7EB" };
    return (
        <span style={{
            background: meta.bg, color: meta.fg, border: `1px solid ${meta.bd}`,
            fontSize: "12px", fontWeight: 700, padding: "2px 6px", borderRadius: "4px"
        }}>{sev || "UNKNOWN"}</span>
    );
};

export default function LogPage() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCountry, setSelectedCountry] = useState("ALL");
    const [activeTab, setActiveTab] = useState("INGREDIENT");

    const loadData = async () => {
        try {
            setLoading(true);
            const categoryPath = activeTab === "INGREDIENT" ? "ingredient" : "marketing";
            const path = selectedCountry === "ALL"
                ? `/api/log/${categoryPath}`
                : `/api/log/${categoryPath}/${selectedCountry}`;

            const token = localStorage.getItem("cosy_access_token");
            const data = await apiFetch(path, { token });
            if (Array.isArray(data)) {
                setLogs(data.sort((a, b) => new Date(b.updDate || 0) - new Date(a.updDate || 0)));
            }
        } catch (err) { console.error(err); } finally { setLoading(false); }
    };

    useEffect(() => { loadData(); }, [selectedCountry, activeTab]);

    const filteredLogs = useMemo(() => {
        return logs.filter(log => (log?.productName || "").toLowerCase().includes(searchTerm.toLowerCase()));
    }, [logs, searchTerm]);

    return (
        <div style={{
            width: "100%",
            height: "100vh",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            backgroundColor: "#f3f4f6",
            padding: "20px"
        }}>
            <div className="cosy-panel" style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                backgroundColor: "white",
                borderRadius: "16px",
                padding: "24px",
                overflow: "hidden"
            }}>

                {/* 상단 고정 영역 (헤더/필터) */}
                <div style={{ flexShrink: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "20px" }}>
                        <div>
                            <h2 style={{ margin: 0, fontSize: "22px", fontWeight: 1000 }}>검사 이력 조회</h2>
                            <div style={{ display: "flex", gap: "20px", marginTop: "15px" }}>
                                {["INGREDIENT", "MARKETING"].map(tab => (
                                    <button key={tab} onClick={() => setActiveTab(tab)} style={{
                                        padding: "8px 4px", fontSize: "16px", fontWeight: 800, cursor: "pointer", border: "none", background: "none",
                                        color: activeTab === tab ? "#1D4ED8" : "#9CA3AF",
                                        borderBottom: activeTab === tab ? "3px solid #1D4ED8" : "3px solid transparent"
                                    }}>
                                        {tab === "INGREDIENT" ? "성분 분석 이력" : "문구 분석 이력"}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <button className="cosy-btn" onClick={loadData} disabled={loading} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <RefreshCw size={16} className={loading ? "cosy-spin" : ""} /> 새로고침
                        </button>
                    </div>

                    <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
                        <div style={{ flex: 1, padding: "10px 14px", display: "flex", alignItems: "center", gap: "10px", border: "1px solid #E5E7EB", borderRadius: "10px" }}>
                            <Search size={18} color="#9CA3AF" />
                            <input type="text" placeholder="제품명으로 검색..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                                   style={{ border: "none", outline: "none", width: "100%", fontSize: "14px", fontWeight: 600 }} />
                        </div>
                        <div style={{ display: "flex", gap: "6px" }}>
                            {["ALL", "US", "JP", "CN", "EU"].map(c => (
                                <button key={c} onClick={() => setSelectedCountry(c)} style={{
                                    padding: "8px 14px", borderRadius: "8px", border: "1px solid #E5E7EB",
                                    backgroundColor: selectedCountry === c ? "#1D4ED8" : "#FFFFFF",
                                    color: selectedCountry === c ? "#FFFFFF" : "#4B5563", fontWeight: 700, cursor: "pointer", fontSize: "13px"
                                }}>{c === "ALL" ? "전체" : c}</button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* [핵심] 테이블 스크롤 영역 */}
                <div style={{
                    flex: 1,
                    overflowY: "auto",
                    minHeight: 0,
                    border: "1px solid #E5E7EB",
                    borderRadius: "12px"
                }}>
                    <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, tableLayout: "fixed" }}>
                        <thead style={{
                            position: "sticky",
                            top: 0,
                            zIndex: 10,
                            backgroundColor: "#F8FAFC"
                        }}>
                        <tr>
                            <th style={{ ...thStyle, width: "150px" }}>날짜</th>
                            <th style={{ ...thStyle, width: "180px" }}>제품명</th>
                            <th style={{ ...thStyle, width: "80px", textAlign: "center" }}>국가</th>
                            <th style={{ ...thStyle, width: "100px", textAlign: "center" }}>결과</th>
                            {activeTab === "INGREDIENT" ? (
                                <>
                                    <th style={{ ...thStyle, width: "30%" }}>화장품 전성분</th>
                                    <th style={{ ...thStyle, width: "30%" }}>성분 규제 근거</th>
                                </>
                            ) : (
                                <th style={{ ...thStyle }}>마케팅 문구 규정</th>
                            )}
                        </tr>
                        </thead>
                        <tbody>
                        {filteredLogs.map((log) => (
                            <tr key={log.logId} style={{ borderBottom: "1px solid #F1F5F9" }}>
                                <td style={tdStyle}>{log.updDate?.replace('T', ' ').substring(0, 16)}</td>
                                <td style={{ ...tdStyle, fontWeight: 700 }}>{log.productName}</td>
                                <td style={{ ...tdStyle, textAlign: "center" }}><CountryPill value={log.country} /></td>
                                <td style={{ ...tdStyle, textAlign: "center" }}>
                                    <SeverityPill value={activeTab === "INGREDIENT" ? log.ingredientStatus : log.marketingStatus} />
                                </td>
                                {activeTab === "INGREDIENT" ? (
                                    <>
                                        <td style={{ ...tdStyle, fontWeight: 600, wordBreak: "keep-all" }}>{log.cautiousIngredient || "-"}</td>
                                        <td style={{ ...tdStyle, whiteSpace: "pre-wrap", wordBreak: "break-all" }}>{log.ingredientLaw || "-"}</td>
                                    </>
                                ) : (
                                    <td style={{ ...tdStyle, whiteSpace: "pre-wrap" }}>{log.marketingLaw || "-"}</td>
                                )}
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

const thStyle = { padding: "14px", textAlign: "left", fontSize: "13px", fontWeight: "800", color: "#475569", borderBottom: "2px solid #EDF2F7", backgroundColor: "#F8FAFC" };
const tdStyle = { padding: "14px", fontSize: "13px", color: "#334155", borderBottom: "1px solid #F1F5F9", wordBreak: "break-all", overflowWrap: "break-word", verticalAlign: "top" };