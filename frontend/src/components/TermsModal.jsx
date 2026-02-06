import React, {useState, useEffect, useRef, useCallback} from "react";

export default function TermsModal({open, onAgree, onClose, title, htmlUrl}) {
    const [html, setHtml] = useState("");
    const [scrolledToBottom, setScrolledToBottom] = useState(false);
    const contentRef = useRef(null);

    useEffect(() => {
        if (open && htmlUrl) {
            setScrolledToBottom(false);
            fetch(htmlUrl)
                .then((res) => res.text())
                .then((text) => {
                    const match = text.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
                    setHtml(match ? match[1] : text);
                })
                .catch(() => setHtml("<p>내용을 불러올 수 없습니다.</p>"));
        }
    }, [open, htmlUrl]);

    useEffect(() => {
        if (open && contentRef.current) {
            contentRef.current.scrollTop = 0;
        }
    }, [open, html]);

    const handleScroll = useCallback((e) => {
        const el = e.target;
        if (el.scrollHeight - el.scrollTop - el.clientHeight < 20) {
            setScrolledToBottom(true);
        }
    }, []);

    if (!open) return null;

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 9999,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(0,0,0,0.45)",
                padding: "24px",
            }}
        >
            <div
                style={{
                    width: "520px",
                    maxHeight: "85vh",
                    backgroundColor: "white",
                    borderRadius: "16px",
                    border: "1px solid #e5e7eb",
                    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.08)",
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                }}
            >
                {/* 헤더 */}
                <div
                    style={{
                        padding: "20px 28px 16px",
                        borderBottom: "1px solid #e5e7eb",
                        textAlign: "center",
                    }}
                >
                    <div
                        style={{
                            fontSize: "20px",
                            fontWeight: 800,
                            color: "#111827",
                        }}
                    >
                        {title}
                    </div>
                </div>

                {/* 본문 스크롤 영역 */}
                <div
                    ref={contentRef}
                    onScroll={handleScroll}
                    style={{
                        flex: 1,
                        overflowY: "auto",
                        padding: "20px 28px",
                        fontSize: "14px",
                        lineHeight: "1.8",
                        color: "#374151",
                    }}
                >
                    <style>{`
                        .terms-modal-body h1 { font-size: 18px; margin: 0 0 12px; }
                        .terms-modal-body h2 { font-size: 16px; margin: 20px 0 8px; }
                    `}</style>
                    <div
                        className="terms-modal-body"
                        dangerouslySetInnerHTML={{__html: html}}
                    />
                </div>

                {/* 하단 버튼 영역 */}
                <div
                    style={{
                        padding: "16px 28px",
                        borderTop: "1px solid #e5e7eb",
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: "10px",
                    }}
                >
                    <button
                        type="button"
                        onClick={onClose}
                        style={{
                            height: "42px",
                            padding: "0 20px",
                            borderRadius: "12px",
                            border: "1px solid #e5e7eb",
                            backgroundColor: "white",
                            color: "#374151",
                            fontSize: "14px",
                            fontWeight: 700,
                            cursor: "pointer",
                        }}
                    >
                        닫기
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            onAgree();
                        }}
                        disabled={!scrolledToBottom}
                        style={{
                            height: "42px",
                            padding: "0 20px",
                            borderRadius: "12px",
                            border: "none",
                            backgroundColor: scrolledToBottom ? "#3b82f6" : "#9ca3af",
                            color: "white",
                            fontSize: "14px",
                            fontWeight: 700,
                            cursor: scrolledToBottom ? "pointer" : "not-allowed",
                            opacity: scrolledToBottom ? 1 : 0.7,
                        }}
                    >
                        동의합니다
                    </button>
                </div>
            </div>
        </div>
    );
}
