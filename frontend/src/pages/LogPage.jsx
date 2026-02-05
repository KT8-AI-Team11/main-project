import React, { useEffect, useState, useMemo } from "react";
import { Search, Globe, Calendar, FileText, RefreshCw, Loader2 } from "lucide-react";

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
    JP: { bg: "#EFF6FF", fg: "#BE123C", bd: "#FDA4AF" },
    CN: { bg: "#EFF6FF", fg: "#B91C1C", bd: "#FECACA" },
    EU: { bg: "#EFF6FF", fg: "#16A34A", bd: "#D1FAE5" },
};

const CountryPill = ({ value }) => {
    const sev = String(value || "").toUpperCase();
    const meta = COUNTRY_META[sev] || { bg: "#F3F4F6", fg: "#374151", bd: "#E5E7EB" };

    return (
        <span className="country-pill" style={{
            background: meta.bg,
            color: meta.fg,
            border: `1px solid ${meta.bd}`,
            fontSize: "12px",
            fontWeight: 700,
            padding: "2px 6px",
            borderRadius: "4px",
            display: "inline-block",
            lineHeight: "1"
        }}>
            {sev || "UNKNOWN"}
        </span>
    );
};

export default function LogPage() {
    const [logs, setLogs] = useState([]); // 반드시 빈 배열로 초기화
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const loadData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("cosy_access_token");
            if (!token) throw new Error("토큰이 없습니다.");

            const response = await fetch(API_BASE_URL, {
                method: "GET",
                headers: getAuthHeader()
            });

            if (!response.ok) throw new Error("데이터 요청 실패");

            const data = await response.json();

            // 데이터가 배열인지 확인 후 정렬
            if (Array.isArray(data)) {
                const sorted = data.sort((a, b) => new Date(b.updDate || 0) - new Date(a.updDate || 0));
                setLogs(sorted);
            } else {
                setLogs([]); // 배열이 아니면 빈 배열로 세팅하여 에러 방지
            }
        } catch (err) {
            console.error("Log loading error:", err);
            setLogs([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // 🛡️ 필터링 시 null 세이프티 강화
    const filteredLogs = useMemo(() => {
        if (!Array.isArray(logs)) return [];
        return logs.filter(log => {
            const pId = String(log?.productId || "");
            const ing = (log?.cautiousIngredient || "").toLowerCase();
            const search = searchTerm.toLowerCase();
            return pId.includes(search) || ing.includes(search);
        });
    }, [logs, searchTerm]);

    return (
        <div className="cosy-page" style={{ padding: "20px", height: "100%", overflowY: "auto" }}>
            <div className="cosy-panel is-tall">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 1000 }}>검사 이력 조회</h2>
                        <p style={{ margin: 0, fontSize: "13px", color: "#6B7280" }}>우리 회사가 수행한 모든 성분 검사 기록입니다.</p>
                    </div>
                    <button className="cosy-btn" onClick={loadData} disabled={loading} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <RefreshCw size={16} className={loading ? "cosy-spin" : ""} />
                        새로고침
                    </button>
                </div>

                <div className="cosy-card" style={{ padding: "12px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px", border: "1px solid #E5E7EB", borderRadius: "10px" }}>
                    <Search size={18} color="#9CA3AF" />
                    <input
                        type="text"
                        placeholder="제품 ID 또는 주의 성분으로 검색..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ border: "none", outline: "none", width: "100%", fontSize: "14px" }}
                    />
                </div>

                {loading ? (
                    <div className="cosy-center-box" style={{ padding: "100px 0" }}>
                        <Loader2 size={40} className="cosy-spin" color="#1D4ED8" />
                        <p>데이터를 가져오는 중입니다...</p>
                    </div>
                ) : filteredLogs.length === 0 ? (
                    <div className="cosy-center-box" style={{ padding: "100px 0", textAlign: "center", background: "#F9FAFB", borderRadius: "12px" }}>
                        <FileText size={48} color="#D1D5DB" style={{ marginBottom: "10px" }} />
                        <p style={{ fontWeight: 600, color: "#4B5563" }}>검사 기록이 없습니다.</p>
                    </div>
                ) : (
                    <div className="cosy-table-wrap" style={{ border: "1px solid #E5E7EB", borderRadius: "8px", overflowX: "auto", backgroundColor: "#FFFFFF" }}>
                        <table className="cosy-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead style={{ background: "#F3F4F6" }}>
                            <tr>
                                <th style={{ padding: "12px", textAlign: "left", width: "160px" }}>날짜</th>
                                <th style={{ padding: "12px", textAlign: "left", width: "100px" }}>제품명</th>
                                <th style={{ padding: "12px", textAlign: "left", width: "80px" }}>국가</th>
                                <th style={{ padding: "12px", textAlign: "center", width: "100px" }}>위험도</th>
                                <th style={{ padding: "12px", textAlign: "left" }}>주의 성분</th>
                                <th style={{ padding: "12px", textAlign: "left" }}>관련 규정 요약</th>
                            </tr>
                            </thead>
                            <tbody>
                            {filteredLogs.map((log) => (
                                <tr key={log?.logId || Math.random()} style={{ borderTop: "1px solid #E5E7EB", backgroundColor: "#FFFFFF" }}>
                                    <td style={{ padding: "12px", fontSize: "13px", color: "#6B7280", verticalAlign: "top" }}>
                                        {log?.updDate ? (
                                            (() => {
                                                const [date, time] = log.updDate.split('T');
                                                const [hh, mm] = time.split(':');
                                                return `${date} ${hh}시 ${mm}분`;
                                            })()
                                        ) : "-"}
                                    </td>
                                    <td style={{ padding: "12px", fontWeight: 800, verticalAlign: "top" }}>{log?.productName || "-"}</td>
                                    <td style={{ padding: "12px", verticalAlign: "top" }}>
                                        <span style={{ padding: "12px", textAlign: "center", verticalAlign: "top" }}>
                                            <CountryPill value={log?.country || "-"} />
                                        </span>
                                    </td>
                                    <td style={{ padding: "12px", textAlign: "center", verticalAlign: "top" }}>
                                        <SeverityPill value={log?.approvalStatus} />
                                    </td>
                                    {/* 주의 성분: 내용이 길 경우를 대비해 줄바꿈 허용 */}
                                    <td style={{
                                        padding: "12px",
                                        fontSize: "13px",
                                        whiteSpace: "normal",
                                        wordBreak: "keep-all",
                                        verticalAlign: "top",
                                        minWidth: "150px"
                                    }}>
                                        {log?.cautiousIngredient || "-"}
                                    </td>
                                    {/* ✅ 관련 규정 요약: 잘림 방지 설정 적용 */}
                                    <td style={{
                                        padding: "12px",
                                        fontSize: "12px",
                                        color: "#4B5563",
                                        verticalAlign: "top",
                                        minWidth: "250px" // 너무 좁아지지 않게 설정
                                    }}>
                                        <div style={{
                                            whiteSpace: "normal",    // 자동 줄바꿈
                                            wordBreak: "break-all", // 긴 단어 줄바꿈
                                            lineHeight: "1.5",       // 가독성을 위한 줄간격
                                            overflow: "visible",     // 숨김 해제
                                            maxHeight: "none"        // 높이 제한 해제
                                        }}>
                                            {log?.ingredientLaw || "-"}
                                        </div>
                                    </td>
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