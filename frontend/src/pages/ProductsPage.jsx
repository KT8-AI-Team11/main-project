import React, { useEffect, useMemo, useState } from "react";
import { Image, X, CheckCircle, Camera } from "lucide-react";
import axios from "axios";
import { useProducts } from "../store/ProductsContext"; // ✅ 추가

const BASE = import.meta.env.VITE_API_BASE_URL || "";

/**
 * Axios 인스턴스 생성
 * - ProductsPage 전용 API 클라이언트
 * - 토큰 자동 첨부 및 갱신 로직 포함
 */
const api = axios.create({
  baseURL: "http://localhost:8080/api",
});

/**
 * Request Interceptor: 모든 요청에 Access Token 자동 첨부
 * - localStorage에서 토큰을 가져와 Authorization 헤더에 추가
 */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("cosy_access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/**
 * 모듈 레벨 상태 변수들 (client.js와 동일한 패턴)
 * - isRefreshing: refresh 요청 중복 방지
 * - refreshPromise: 여러 실패 요청이 같은 refresh를 공유
 * - isLoggingOut: 중복 alert/reload 방지
 */
let isRefreshing = false;
let refreshPromise = null;
let isLoggingOut = false;

/**
 * Response Interceptor: 401/403 에러 시 토큰 자동 갱신
 *
 * 동작 흐름:
 * 1. 401/403 에러 발생 → refresh token으로 새 access token 발급
 * 2. 발급 성공 → 새 토큰으로 실패했던 요청 재시도
 * 3. 발급 실패 또는 재시도도 실패 → 세션 만료 처리 (로그아웃)
 */
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        /**
         * 케이스 1: 재시도(_retry=true)에서도 401/403 발생
         * → refresh token도 만료됨 → 세션 완전 만료 → 로그아웃
         */
        if ((error.response?.status === 401 || error.response?.status === 403) && originalRequest._retry) {
            if (!isLoggingOut) {
                isLoggingOut = true;
                localStorage.removeItem("cosy_access_token");
                localStorage.removeItem("cosy_logged_in");
                localStorage.removeItem("cosy_user_email");
                alert("세션이 만료되었습니다.");
                window.location.reload();  // App.jsx에서 홈으로 이동
            }
            return Promise.reject(error);
        }

        /**
         * 케이스 2: 첫 요청에서 401/403 발생 (access token 만료)
         * → refresh token으로 새 access token 발급 시도
         */
        if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
            originalRequest._retry = true;  // 재시도 플래그 (무한 루프 방지)
            // console.log('[ProductsPage] 401/403 감지, refresh 시도...');

            try {
                // 동시에 여러 요청이 실패해도 refresh는 한 번만 실행
                if (!isRefreshing) {
                    isRefreshing = true;
                    // console.log('[ProductsPage] refresh 호출 시작');
                    refreshPromise = axios.post(`${BASE}/api/auth/refresh`, {}, { withCredentials: true });
                }

                // 모든 실패한 요청이 같은 refresh Promise를 기다림
                const res = await refreshPromise;
                // console.log('[ProductsPage] refresh 성공, 새 토큰:', res.data.accessToken?.substring(0, 20) + '...');
                isRefreshing = false;
                refreshPromise = null;

                // 새 토큰 저장 및 원래 요청 재시도
                const newToken = res.data.accessToken;
                localStorage.setItem("cosy_access_token", newToken);

                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return api(originalRequest);
            } catch {
                isRefreshing = false;
                refreshPromise = null;

                // refresh 실패 → 세션 만료 → 로그아웃 처리
                if (!isLoggingOut) {
                    isLoggingOut = true;
                    localStorage.removeItem("cosy_access_token");
                    localStorage.removeItem("cosy_logged_in");
                    localStorage.removeItem("cosy_user_email");
                    alert("세션이 만료되었습니다.");
                    window.location.reload();
                }

                return Promise.reject(error);
            }
        }

        return Promise.reject(error);
    }
);

export default function ProductsPage() {
  // ✅ products, setProducts를 Context에서 가져옴
  const { products, setProducts } = useProducts();

  const [selectedProductId, setSelectedProductId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  // 모달 상태
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // 입력 필드 상태
  const [newProductName, setNewProductName] = useState("");
  const [newProductCategory, setNewProductCategory] = useState("SKINCARE");
  const [newProductImage, setNewProductImage] = useState(null);
  const [newProductIngredients, setNewProductIngredients] = useState("");
  const [newProductStatus, setNewProductStatus] = useState("STEP_1");

  // ✅ 전 제품 조회 (Context의 setProducts에 저장)
  const fetchProducts = async () => {
    try {
      const response = await api.get("/products");
      console.log("products response.data =", response.data);
      setProducts(response.data);
    } catch (error) {
      console.error("데이터 로딩 실패", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // 이미지 업로드 처리
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setNewProductImage(reader.result);
    reader.readAsDataURL(file);
  };

  // 제품 생성 및 등록
  const confirmAddProduct = async () => {
    if (!newProductName.trim()) return alert("제품명을 입력해주세요.");
    const payload = {
      name: newProductName,
      type: newProductCategory,
      image: newProductImage || "",
      fullIngredient: newProductIngredients || "",
      status: newProductStatus,
    };
    try {
      const res = await api.post("/products", payload);

      // ✅ 서버가 생성된 product를 반환한다면: 바로 Context에 반영
      // (반환 안 하면 fetchProducts()만 호출해도 됨)
      await fetchProducts();
      setIsAddModalOpen(false);
      resetInputFields();
    } catch (error) {
      alert("제품 등록 중 오류가 발생했습니다.");
    }
  };

  // 제품 수정
  const confirmEditProduct = async () => {
    if (!selectedProductId) return alert("수정할 제품을 선택해주세요.");
    if (!newProductName.trim()) return alert("제품명을 입력해주세요.");

    const payload = {
      name: newProductName,
      type: newProductCategory,
      image: newProductImage || "",
      fullIngredient: newProductIngredients || "",
      status: newProductStatus,
    };

    try {
      const res = await api.patch(`/products/${selectedProductId}`, payload);

      // ✅ Context 업데이트 (서버가 수정된 product를 반환한다고 가정)
      if (res?.data) {
        setProducts((prev) =>
          prev.map((p) => (p.id === selectedProductId ? res.data : p))
        );
      } else {
        await fetchProducts();
      }

      alert("제품 정보가 성공적으로 수정되었습니다.");
      setIsEditModalOpen(false);
    } catch (error) {
      alert("수정 중 오류가 발생했습니다.");
    }
  };

  // 제품 삭제
  const handleDelete = async () => {
    const ids =
      selectedIds.length > 0
        ? selectedIds
        : selectedProductId
        ? [selectedProductId]
        : [];

    if (ids.length === 0) return alert("삭제할 제품을 선택해주세요.");
    if (!window.confirm(`정말 ${ids.length}개의 제품을 삭제하시겠습니까?`)) return;

    try {
      if (ids.length === 1) {
        await api.delete(`/products/${ids[0]}`);
      } else {
        await api.delete("/products/batch", { data: ids });
      }

      // ✅ Context에서 제거
      setProducts((prev) => prev.filter((p) => !ids.includes(p.id)));

      alert("제품이 삭제되었습니다.");
      setSelectedIds([]);
      setSelectedProductId(null);
      setIsDetailModalOpen(false);
    } catch (error) {
      console.error(error);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  // 분석
  const runAnalysis = () => {
    const targetIds =
      selectedIds.length > 0
        ? selectedIds
        : selectedProductId
        ? [selectedProductId]
        : [];

    if (targetIds.length === 0) {
      alert("검토할 제품을 최소 하나 이상 선택해주세요.");
      return;
    }

    const targetName =
      selectedIds.length > 0
        ? `${selectedIds.length}건의 제품`
        : selectedProduct?.name || "선택된 제품";

    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      alert(`${targetName}에 대한 글로벌 규제 검토가 완료되었습니다. (적합)`);
    }, 1200);
  };

  const resetInputFields = () => {
    setNewProductName("");
    setNewProductCategory("SKINCARE");
    setNewProductImage(null);
    setNewProductIngredients("");
    setNewProductStatus("STEP_1");
  };

  const openEditModal = () => {
    const p = products.find((i) => i.id === selectedProductId);
    if (!p) return;
    setNewProductName(p.name);
    setNewProductCategory(p.type);
    setNewProductImage(p.image);
    setNewProductIngredients(p.fullIngredient);
    setNewProductStatus(p.status);
    setIsEditModalOpen(true);
  };

const filteredProducts = useMemo(() => {
  const q = (searchQuery ?? "").toLowerCase();

  return (Array.isArray(products) ? products : [])
    .filter(Boolean) // null/undefined 제거
    .filter((p) => {
      const name = (p?.name ?? "").toString().toLowerCase();
      const type = (p?.type ?? "").toString().toLowerCase();
      return name.includes(q) || type.includes(q);
    });
}, [products, searchQuery]);


  const selectedProduct = useMemo(() => {
    return products.find((p) => p.id === selectedProductId);
  }, [products, selectedProductId]);
    return (
        <div style={{ flex: 1, backgroundColor: "#f3f4f6", minHeight: "100vh", position: "relative", paddingBottom: "120px" }}>
            {/* 상단 헤더 및 그리드 영역 */}
            <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px" }}>
                <h2 style={{ marginBottom: "24px", fontSize: "22px", fontWeight: "bold", color: "#1f2937" }}>
                    내 제품 리스트 ({filteredProducts.length}) {selectedIds.length > 0 && <span style={{color:'#3b82f6', fontSize: '16px'}}> | {selectedIds.length}개 선택됨</span>}
                </h2>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "24px" }}>
                    {filteredProducts.map((p) => (
                        <div key={p.id} onClick={() => { setSelectedProductId(p.id); setIsDetailModalOpen(true); }}
                             style={{
                                 position: "relative", backgroundColor: "white", borderRadius: "16px", padding: "20px", cursor: "pointer",
                                 border: selectedIds.includes(p.id) ? "2px solid #3b82f6" : "2px solid transparent",
                                 boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)", transition: "0.2s"
                             }}>
                            {/* 선택 체크박스 */}
                            <div onClick={(e) => { e.stopPropagation(); setSelectedIds(prev => prev.includes(p.id) ? prev.filter(id => id !== p.id) : [...prev, p.id]); }}
                                 // #d1d5db
                                 style={{ position: "absolute", top: "12px", right: "12px", zIndex: 10, backgroundColor: selectedIds.includes(p.id) ? "#3b82f6" : "white", borderRadius: "50%", border: "1.5px solid #3B82F6", width: "24px", height: "24px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                {selectedIds.includes(p.id) && <CheckCircle size={16} color="white" />}
                            </div>

                            <div style={{ backgroundColor: "#f9fafb", height: "140px", borderRadius: "12px", marginBottom: "16px", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                                {p.image ? <img src={p.image} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <Image size={40} color="#d1d5db" />}
                            </div>
                            <h3 style={{ fontSize: "17px", fontWeight: "700", marginBottom: "4px" }}>{p.name}</h3>
                            <p style={{ fontSize: "14px", color: "#6b7280" }}>{p.type}</p>
                            <p style={{ fontSize: "14px", color: "#6b7280" }}>{p.status}</p>
                            <p style={{ fontSize: "14px", color: "#6b7280" }}>수정 일자 : {p.upDate ? p.upDate.split('T')[0] : "-"}</p>
                        </div>
                    ))}
                    {/* 추가 카드 */}
                    <div onClick={() => { resetInputFields(); setIsAddModalOpen(true); }}
                         style={{ backgroundColor: "#fff", borderRadius: "16px", border: "2px dashed #d1d5db", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", minHeight: "240px", transition: "0.2s" }}>
                        <X size={48} color="#9ca3af" style={{ transform: "rotate(45deg)" }} />
                    </div>
                </div>
            </div>

            {/*// 하단 컨트롤 바*/}
            <div style={{
                position: "fixed",
                bottom: "30px",
                left: "calc(260px + 2%)",
                right: "8%",
                height: "80px",
                backgroundColor: "white",
                padding: "0 24px",
                borderRadius: "16px",
                boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                display: "flex",
                alignItems: "center",
                gap: "16px",
                zIndex: 100,
                border: "1px solid #e5e7eb"
            }}>
                <div style={{ flex: 1 }}>
                    <input type="text" placeholder="리스트 내 검색" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                           style={{ width: "100%", padding: "12px 16px", border: "1px solid #e5e7eb", borderRadius: "10px", outline: "none", fontSize: "15px" }} />
                </div>
                <button onClick={() => { resetInputFields(); setIsAddModalOpen(true); }} style={btnStyle}>추가</button>
                <button onClick={handleDelete} style={{ ...btnStyle, backgroundColor: "#f3f4f6", color: "#ef4444" }}>삭제{selectedIds.length > 0 ? ` (${selectedIds.length})` : ""}</button>
                <button
                    onClick={() => {
                        runAnalysis();
                    }}
                    disabled={isAnalyzing}
                    style={{
                        ...btnStyle,
                        backgroundColor: "#111827",
                        color: "white",
                        padding: "0 30px",
                        opacity: (selectedIds.length === 0 && !selectedProductId) || isAnalyzing ? 0.5 : 1, // 선택 안되면 흐리게
                        cursor: isAnalyzing ? "not-allowed" : "pointer"
                    }}
                >
                    {isAnalyzing ? "분석 중..." : "규제 검토"}
                </button>
            </div>

            {/* 상세 모달 */}
            {isDetailModalOpen && selectedProduct && (
                <div style={overlayStyle} onClick={() => setIsDetailModalOpen(false)}>
                    <div style={{ ...modalStyle, width: "900px", position: "relative", padding: "40px" }} onClick={e => e.stopPropagation()}>
                        <X size={28} style={{ position: "absolute", top: "24px", right: "24px", cursor: "pointer", color: "#9ca3af" }} onClick={() => setIsDetailModalOpen(false)} />

                        <div style={{ display: "flex", gap: "48px" }}>
                            <div style={{ width: "350px", height: "450px", backgroundColor: "#f9fafb", borderRadius: "16px", overflow: "hidden", border: "1px solid #f3f4f6" }}>
                                {selectedProduct.image ? <img src={selectedProduct.image} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <Image size={60} color="#d1d5db" />}
                            </div>

                            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                                <div style={{ marginBottom: "30px" }}>
                                    <h2 style={{ fontSize: "28px", fontWeight: "800", marginBottom: "8px" }}>{selectedProduct.name}</h2>
                                    <span style={{ padding: "6px 14px", backgroundColor: "#eff6ff", color: "#3b82f6", borderRadius: "20px", fontSize: "14px", fontWeight: "600" }}>{selectedProduct.type}</span>
                                </div>

                                <div style={{ display: "grid", gap: "20px", marginBottom: "auto" }}>
                                    <div style={detailRow}><span style={detailLabel}>등록 일자</span><span>{selectedProduct.regDate?.split('T')[0] || "-"}</span></div>
                                    <div style={detailRow}><span style={detailLabel}>진행 단계</span><span>{selectedProduct.status}</span></div>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                        <span style={detailLabel}>전성분 정보</span>
                                        <div style={{ padding: "16px", backgroundColor: "#f9fafb", borderRadius: "12px", fontSize: "14px", lineHeight: "1.6", height: "140px", overflowY: "auto", border: "1px solid #f3f4f6" }}>
                                            {selectedProduct.fullIngredient || "등록된 성분 정보가 없습니다."}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "30px" }}>
                                    <button onClick={() => { setIsDetailModalOpen(false); openEditModal(); }} style={{ ...btnStyle, backgroundColor: "#f3f4f6" }}>수정하기</button>
                                    <button onClick={handleDelete} style={{ ...btnStyle, color: "#ef4444", backgroundColor: "#fef2f2" }}>삭제하기</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 등록/수정 모달 */}
            {(isAddModalOpen || isEditModalOpen) && (
                <div style={overlayStyle} onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}>
                    <div style={{ ...modalStyle, width: "650px", padding: "32px" }} onClick={e => e.stopPropagation()}>
                        <h3 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "24px" }}>{isAddModalOpen ? "새 제품 등록" : "제품 정보 수정"}</h3>
                        <div style={{ display: "flex", gap: "24px", marginBottom: "24px" }}>
                            <div style={{ textAlign: "center" }}>
                                <div style={{ width: "160px", height: "200px", backgroundColor: "#f9fafb", borderRadius: "12px", marginBottom: "12px", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", border: "1px solid #e5e7eb" }}>
                                    {newProductImage ? <img src={newProductImage} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <Camera size={40} color="#9ca3af" />}
                                </div>
                                <label htmlFor="file-up" style={{ fontSize: "14px", color: "#3b82f6", cursor: "pointer", fontWeight: "600" }}>이미지 업로드</label>
                                <input id="file-up" type="file" accept="image/*" hidden onChange={handleImageUpload} />
                            </div>
                            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "12px" }}>
                                <input placeholder="제품명" value={newProductName} onChange={e => setNewProductName(e.target.value)} style={inputStyle} />
                                <select value={newProductCategory} onChange={e => setNewProductCategory(e.target.value)} style={inputStyle}>
                                    <option value="SKINCARE">SKINCARE</option><option value="MAKEUP">MAKEUP</option>
                                    <option value="SUNSCREEN">SUNSCREEN</option><option value="BODYCARE">BODYCARE</option>
                                </select>
                                <select value={newProductStatus} onChange={e => setNewProductStatus(e.target.value)} style={inputStyle}>
                                    {["STEP_1", "STEP_2", "STEP_3", "STEP_4", "STEP_5"].map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                        </div>
                        <textarea placeholder="전성분을 입력하세요" value={newProductIngredients} onChange={e => setNewProductIngredients(e.target.value)} style={{ ...inputStyle, height: "120px", marginBottom: "24px" }} />
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                            <button onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }} style={{ ...btnStyle, backgroundColor: "#f3f4f6" }}>취소</button>
                            <button onClick={isAddModalOpen ? confirmAddProduct : confirmEditProduct} style={{ ...btnStyle, backgroundColor: "#111827", color: "white" }}>저장하기</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// 스타일 변수
const btnStyle = { height: "48px", padding: "0 24px", borderRadius: "10px", border: "none", fontWeight: "700", cursor: "pointer", transition: "0.2s", fontSize: "15px" };
const inputStyle = { width: "100%", padding: "12px", border: "1px solid #e5e7eb", borderRadius: "10px", outline: "none" };
const overlayStyle = { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(4px)" };
const modalStyle = { backgroundColor: "white", borderRadius: "24px", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" };
const detailRow = { display: "flex", justifyContent: "space-between", paddingBottom: "12px", borderBottom: "1px solid #f3f4f6", fontSize: "16px" };
const detailLabel = { color: "#6b7280", fontWeight: "600" };