import React, { useEffect, useState, useMemo } from "react";
import { Search, FileText, RefreshCw, Loader2 } from "lucide-react";

const API_BASE_URL = "http://localhost:8080/api/log";

const getAuthHeader = () => ({
    "Content-Type": "application/json",
    "Authorization": `Bearer ${localStorage.getItem("cosy_access_token")}`
});

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
        }}>
            {sev || "UNKNOWN"}
        </span>
    );
};

const COUNTRY_META = {
    US: { bg: "#EFF6FF", fg: "#1E40AF", bd: "#DBEAFE" },
    JP: { bg: "#FDF2F8", fg: "#BE123C", bd: "#FDA4AF" },
    CN: { bg: "#FEF2F2", fg: "#B91C1C", bd: "#FECACA" },
    EU: { bg: "#F0FDF4", fg: "#16A34A", bd: "#D1FAE5" },
};

const CountryPill = ({ value }) => {
    const sev = String(value || "").toUpperCase();
    const meta = COUNTRY_META[sev] || { bg: "#F3F4F6", fg: "#374151", bd: "#E5E7EB" };
    return (
        <span style={{
            background: meta.bg, color: meta.fg, border: `1px solid ${meta.bd}`,
            fontSize: "12px", fontWeight: 700, padding: "2px 6px", borderRadius: "4px"
        }}>
            {sev || "UNKNOWN"}
        </span>
    );
};

export default function LogPage() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCountry, setSelectedCountry] = useState("ALL");
    const [activeTab, setActiveTab] = useState("INGREDIENT"); // ✅ 탭 상태 추가

    useEffect(() => {
        loadData();
    }, [selectedCountry, activeTab]); // ✅ 탭 변경 시에도 데이터 재로드

    const loadData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("cosy_access_token");
            if (!token) return;

            // ✅ 분야(탭)에 따른 베이스 URL 결정
            const categoryPath = activeTab === "INGREDIENT" ? "ingredient" : "marketing";

            // ✅ 국가 필터에 따른 최종 URL 결정
            const url = selectedCountry === "ALL"
                ? `${API_BASE_URL}/${categoryPath}`
                : `${API_BASE_URL}/${categoryPath}/${selectedCountry}`;

            const response = await fetch(url, {
                method: "GET",
                headers: getAuthHeader()
            });

            if (!response.ok) throw new Error(`HTTP 에러! 상태코드: ${response.status}`);

            const data = await response.json();

            if (Array.isArray(data)) {
                const sorted = data.sort((a, b) => new Date(b.updDate || 0) - new Date(a.updDate || 0));
                setLogs(sorted);
            } else {
                setLogs([]);
            }
        } catch (err) {
            console.error("데이터 로드 오류:", err);
            setLogs([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredLogs = useMemo(() => {
        if (!Array.isArray(logs)) return [];
        return logs.filter(log => {
            const productName = (log?.productName || "").toLowerCase();
            const search = searchTerm.toLowerCase();
            return productName.includes(search);
        });
    }, [logs, searchTerm]);

    return (
        <div className="cosy-page" style={{ padding: "20px", height: "100%", overflowY: "auto" }}>
            <div className="cosy-panel is-tall">

                {/* 헤더 및 탭 메뉴 */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "20px" }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: "22px", fontWeight: 1000 }}>검사 이력 조회</h2>
                        <div style={{ display: "flex", gap: "20px", marginTop: "15px" }}>
                            <button
                                onClick={() => setActiveTab("INGREDIENT")}
                                style={{
                                    padding: "8px 4px", fontSize: "16px", fontWeight: 800, cursor: "pointer",
                                    border: "none", background: "none",
                                    color: activeTab === "INGREDIENT" ? "#1D4ED8" : "#9CA3AF",
                                    borderBottom: activeTab === "INGREDIENT" ? "3px solid #1D4ED8" : "3px solid transparent"
                                }}
                            >
                                성분 분석 이력
                            </button>
                            <button
                                onClick={() => setActiveTab("MARKETING")}
                                style={{
                                    padding: "8px 4px", fontSize: "16px", fontWeight: 800, cursor: "pointer",
                                    border: "none", background: "none",
                                    color: activeTab === "MARKETING" ? "#1D4ED8" : "#9CA3AF",
                                    borderBottom: activeTab === "MARKETING" ? "3px solid #1D4ED8" : "3px solid transparent"
                                }}
                            >
                                문구 분석 이력
                            </button>
                        </div>
                    </div>
                    <button className="cosy-btn" onClick={loadData} disabled={loading} style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "5px" }}>
                        <RefreshCw size={16} className={loading ? "cosy-spin" : ""} />
                        새로고침
                    </button>
                </div>

                {/* 필터 섹션 */}
                <div style={{ display: "flex", gap: "10px", marginBottom: "20px", alignItems: "center" }}>
                    <div className="cosy-card" style={{ flex: 1, padding: "10px 14px", display: "flex", alignItems: "center", gap: "10px", border: "1px solid #E5E7EB", borderRadius: "10px" }}>
                        <Search size={18} color="#9CA3AF" />
                        <input
                            type="text"
                            placeholder="제품명으로 검색..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ border: "none", outline: "none", width: "100%", fontSize: "14px", fontWeight: 600 }}
                        />
                    </div>
                    <div style={{ display: "flex", gap: "6px" }}>
                        {["ALL", "US", "JP", "CN", "EU"].map((country) => (
                            <button
                                key={country}
                                onClick={() => setSelectedCountry(country)}
                                style={{
                                    padding: "8px 14px", borderRadius: "8px", border: "1px solid #E5E7EB",
                                    backgroundColor: selectedCountry === country ? "#1D4ED8" : "#FFFFFF",
                                    color: selectedCountry === country ? "#FFFFFF" : "#4B5563",
                                    fontWeight: 700, cursor: "pointer", fontSize: "13px"
                                }}
                            >
                                {country === "ALL" ? "전체" : country}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 테이블 영역 */}
                {loading ? (
                    <div className="cosy-center-box" style={{ padding: "100px 0" }}>
                        <Loader2 size={40} className="cosy-spin" color="#1D4ED8" />
                    </div>
                ) : filteredLogs.length === 0 ? (
                    <div className="cosy-center-box" style={{ padding: "80px 0", textAlign: "center", background: "#F9FAFB", borderRadius: "12px" }}>
                        <FileText size={48} color="#D1D5DB" style={{ marginBottom: "10px" }} />
                        <p style={{ fontWeight: 600, color: "#4B5563" }}>검사 기록이 없습니다.</p>
                    </div>
                ) : (
                    <div className="cosy-table-wrap" style={{ border: "1px solid #E5E7EB", borderRadius: "12px", overflow: "hidden", backgroundColor: "#FFFFFF" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead style={{ background: "#F8FAFC", borderBottom: "2px solid #EDF2F7" }}>
                            <tr>
                                <th style={{ padding: "14px", textAlign: "left", width: "150px" }}>날짜</th>
                                <th style={{ padding: "14px", textAlign: "left", width: "180px" }}>제품명</th>
                                <th style={{ padding: "14px", textAlign: "center", width: "80px" }}>국가</th>
                                <th style={{ padding: "14px", textAlign: "center", width: "100px" }}>결과</th>
                                {activeTab === "INGREDIENT" ? (
                                    <>
                                        <th style={{ padding: "14px", textAlign: "left", width: "150px" }}>주의 성분</th>
                                        <th style={{ padding: "14px", textAlign: "left" }}>성분 규제 근거</th>
                                    </>
                                ) : (
                                    <th style={{ padding: "14px", textAlign: "left" }}>마케팅 문구 규정</th>
                                )}
                            </tr>
                            </thead>
                            <tbody>
                            {filteredLogs.map((log) => (
                                <tr key={log.logId} style={{ borderBottom: "1px solid #F1F5F9" }}>
                                    <td style={{ padding: "14px", fontSize: "13px", color: "#64748B" }}>
                                        {log.updDate?.replace('T', ' ').substring(0, 16)}
                                    </td>
                                    <td style={{ padding: "14px", fontWeight: 700 }}>{log.productName}</td>
                                    <td style={{ padding: "14px", textAlign: "center" }}>
                                        <CountryPill value={log.country} />
                                    </td>
                                    <td style={{ padding: "14px", textAlign: "center" }}>
                                        <SeverityPill value={activeTab === "INGREDIENT" ? log.ingredientStatus : log.marketingStatus} />
                                    </td>
                                    {activeTab === "INGREDIENT" ? (
                                        <>
                                            <td style={{ padding: "14px", fontSize: "13px", color: "#334155", fontWeight: 600 }}>
                                                {log.cautiousIngredient || "-"}
                                            </td>
                                            <td style={{ padding: "14px", fontSize: "13px", color: "#334155", whiteSpace: "pre-wrap" }}>
                                                {log.ingredientLaw || "-"}
                                            </td>
                                        </>
                                    ) : (
                                        <td style={{ padding: "14px", fontSize: "13px", color: "#334155", whiteSpace: "pre-wrap" }}>
                                            {log.marketingLaw || "-"}
                                        </td>
                                    )}
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}