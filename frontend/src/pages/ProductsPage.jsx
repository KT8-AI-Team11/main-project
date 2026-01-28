import React, { useEffect, useMemo, useState } from "react";
import { Image, X, ArrowLeft, ArrowRight } from "lucide-react";
import axios from "axios";

// 임시 API 설정
const ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJmcm9udEB0ZXN0LmNvbSIsImNvbXBhbnlJZCI6MTQsImlhdCI6MTc2OTU5NjkyNiwiaXNzIjoiY29zeSIsImV4cCI6MTc2OTYwNzcyNn0.L13aExynqYrDmCVx7WRDr5lzFhPx9BDek9FzEpZNQRU";

const api = axios.create({
    baseURL: "http://localhost:8080/api",
    headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json",
    },
});

export default function ProductsPage() {
    // 상태 관리
    const [products, setProducts] = useState([]);
    const [selectedProductId, setSelectedProductId] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // 모달 상태
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    // 입력 필드 상태
    const [newProductName, setNewProductName] = useState("");
    const [newProductCategory, setNewProductCategory] = useState("SKINCARE");
    const [newProductImage, setNewProductImage] = useState(null);
    const [newProductIngredients, setNewProductIngredients] = useState("");
    const [newProductStatus, setNewProductStatus] = useState("STEP_2");

    // 전 제품 조회
    const fetchProducts = async () => {
        try {
            const response = await api.get('/products');
            setProducts(response.data);
        } catch (error) {
            if (error.response?.status === 401) alert("로그인이 만료되었습니다.");
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    // 검색 필터링
    const filteredProducts = useMemo(() => {
        return products.filter((p) =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.type && p.type.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }, [products, searchQuery]);

    const selectedProduct = useMemo(() => {
        return products.find((p) => p.id === selectedProductId);
    }, [products, selectedProductId]);

    // TODO: 이미지 업로드 처리
    const handleImageUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => setNewProductImage(reader.result);
        reader.readAsDataURL(file);
    };

    // 제품 생성/등록
    const confirmAddProduct = async () => {
        if (!newProductName.trim()) return alert("제품명을 입력해주세요.");

        const payload = {
            name: newProductName,
            type: newProductCategory,
            image: newProductImage || "",
            fullIngredient: newProductIngredients || "",
            status: newProductStatus
        };

        try {
            await api.post("/products", payload);
            alert("제품이 성공적으로 등록되었습니다.");
            setIsAddModalOpen(false);
            resetInputFields();
            fetchProducts();
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
            status: newProductStatus
        };

        try {
            await api.patch(`/products/${selectedProductId}`, payload);
            alert("제품 정보가 성공적으로 수정되었습니다.");
            setIsEditModalOpen(false);
            fetchProducts();
        } catch (error) {
            alert("수정 중 오류가 발생했습니다.");
        }
    };

    // 제품 삭제
    const deleteProduct = async () => {
        if (!selectedProductId) return alert("삭제할 제품을 선택해주세요.");
        if (!window.confirm("정말 삭제하시겠습니까?")) return;

        try {
            await api.delete(`/products/${selectedProductId}`);
            alert("제품이 삭제되었습니다.");
            setSelectedProductId(null);
            setIsDetailModalOpen(false);
            fetchProducts();
        } catch (error) {
            alert("삭제 중 오류가 발생했습니다.");
        }
    };

    const resetInputFields = () => {
        setNewProductName("");
        setNewProductCategory("SKINCARE");
        setNewProductImage(null);
        setNewProductIngredients("");
        setNewProductStatus("STEP_2");
    };

    const openAddModal = () => {
        resetInputFields();
        setIsAddModalOpen(true);
    };

    const openEditModal = () => {
        const p = selectedProduct;
        if (!p) return alert("수정할 제품을 선택해주세요.");
        setNewProductName(p.name);
        setNewProductCategory(p.type);
        setNewProductImage(p.image);
        setNewProductIngredients(p.fullIngredient);
        setNewProductStatus(selectedProduct.status);
        setIsEditModalOpen(true);
    };

    const runAnalysis = () => {
        if (!selectedProductId) return alert("분석할 제품을 선택해주세요.");
        setIsAnalyzing(true);
        setTimeout(() => {
            setIsAnalyzing(false);
            alert(`${selectedProduct.name}의 글로벌 규제 검토가 완료되었습니다. (적합)`);
        }, 1200);
    };

    return (
        <div style={{ flex: 1, padding: "40px", backgroundColor: "#f3f4f6", overflowY: "auto", display: "flex", flexDirection: "column" }}>
            <div style={{ maxWidth: "1000px", margin: "0 auto", width: "100%", flex: 1, display: "flex", flexDirection: "column" }}>
                <h2 style={{ marginBottom: "24px", fontSize: "20px", fontWeight: "bold" }}>
                    내 제품 리스트 ({filteredProducts.length})
                </h2>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "20px", marginBottom: "40px", flex: 1 }}>
                    {filteredProducts.map((product) => (
                        <div
                            key={product.id}
                            onClick={() => { setSelectedProductId(product.id); setIsDetailModalOpen(true); }}
                            style={{
                                backgroundColor: "white", borderRadius: "12px", padding: "20px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                                cursor: "pointer", border: selectedProductId === product.id ? "2px solid #3b82f6" : "2px solid transparent",
                                transition: "all 0.2s", height: "fit-content",
                            }}
                        >
                            <div style={{ backgroundColor: "#f3f4f6", height: "100px", borderRadius: "8px", marginBottom: "12px", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                                {product.image ? <img src={product.image} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <Image color="#9ca3af" />}
                            </div>
                            <h3 style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "4px" }}>{product.name}</h3>
                            <p style={{ fontSize: "13px", color: "#6b7280" }}>{product.type}</p>
                            <p style={{ fontSize: "12px", color: "#9ca3af", marginTop: "8px" }}>등록: {product.regDate ? new Date(product.regDate).toLocaleDateString() : "-"}</p>
                        </div>
                    ))}

                    <div onClick={openAddModal} style={{ backgroundColor: "#fff", borderRadius: "12px", border: "2px dashed #d1d5db", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", minHeight: "210px", height: "fit-content" }}>
                        <span style={{ fontSize: "40px", color: "#9ca3af" }}>+</span>
                    </div>
                </div>

                {/* 하단 컨트롤 바 */}
                <div style={{ position: "sticky", bottom: "0", display: "flex", alignItems: "center", gap: "12px", backgroundColor: "white", padding: "16px", borderRadius: "12px", boxShadow: "0 -4px 6px -1px rgba(0,0,0,0.05)", marginTop: "auto" }}>
                    <div style={{ flex: 1, position: "relative" }}>
                        <input
                            type="text"
                            placeholder="리스트 내 검색"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ width: "100%", maxWidth: "500px", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "8px", outline: "none" }}
                        />
                    </div>
                    <button onClick={openAddModal} style={actionButtonStyle}>추가</button>
                    <button onClick={openEditModal} style={actionButtonStyle}>수정</button>
                    <button onClick={deleteProduct} style={{ ...actionButtonStyle, color: "#ef4444" }}>삭제</button>
                    <button onClick={runAnalysis} disabled={isAnalyzing} style={{ ...actionButtonStyle, backgroundColor: "#111827", color: "white" }}>
                        {isAnalyzing ? "분석 중..." : "규제 검토"}
                    </button>
                </div>
            </div>

            {/* 상세 모달 */}
            {isDetailModalOpen && selectedProduct && (
                <DetailModalComponent product={selectedProduct} onClose={() => setIsDetailModalOpen(false)} />
            )}

            {/* 등록/수정 모달 */}
            {(isAddModalOpen || isEditModalOpen) && (
                <ModalComponent
                    title={isAddModalOpen ? "제품 등록" : "제품 수정"}
                    onClose={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}
                    onSave={isAddModalOpen ? confirmAddProduct : confirmEditProduct}
                    name={newProductName}
                    setName={setNewProductName}
                    category={newProductCategory}
                    setCategory={setNewProductCategory}
                    ingredients={newProductIngredients}
                    setIngredients={setNewProductIngredients}
                    status={newProductStatus}
                    setStatus={setNewProductStatus}
                    image={newProductImage}
                    onImageUpload={handleImageUpload}
                />
            )}
        </div>
    );
}

// 상세 모달 컴포넌트
const DetailModalComponent = ({ product, onClose }) => (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0, 0, 0, 0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 3000 }} onClick={onClose}>
        <div style={{ backgroundColor: "white", width: "900px", maxWidth: "95%", borderRadius: "8px", position: "relative", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)", overflow: "hidden" }} onClick={(e) => e.stopPropagation()}>
            <X size={24} style={{ position: "absolute", top: "24px", right: "24px", cursor: "pointer", color: "#6b7280" }} onClick={onClose} />
            <div style={{ padding: "60px 40px", display: "flex", gap: "40px" }}>
                <div style={{ width: "320px", height: "420px", backgroundColor: "#e5e7eb", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {product.image ? <img src={product.image} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ color: "#4b5563" }}>이미지 없음</span>}
                </div>
                <div style={{ flex: 1, border: "1px solid #111827", display: "flex", flexDirection: "column" }}>
                    <div style={{ display: "flex", borderBottom: "1px solid #e5e7eb", backgroundColor: "#f9fafb" }}>
                        <div style={{ width: "140px", padding: "12px 16px", fontWeight: "bold", borderRight: "1px solid #e5e7eb" }}>제품명</div>
                        <div style={{ flex: 1, padding: "12px 16px" }}>{product.name}</div>
                    </div>
                    <div style={{ display: "flex", borderBottom: "1px solid #e5e7eb" }}>
                        <div style={{ width: "140px", padding: "12px 16px", fontWeight: "bold", borderRight: "1px solid #e5e7eb" }}>카테고리</div>
                        <div style={{ flex: 1, padding: "12px 16px" }}>{product.type}</div>
                    </div>
                    <div style={{ display: "flex", borderBottom: "1px solid #e5e7eb", backgroundColor: "#f9fafb" }}>
                        <div style={{ width: "140px", padding: "12px 16px", fontWeight: "bold", borderRight: "1px solid #e5e7eb" }}>등록일</div>
                        <div style={{ flex: 1, padding: "12px 16px" }}>{product.regDate ? new Date(product.regDate).toLocaleDateString() : "-"}</div>
                    </div>
                    <div style={{ display: "flex", borderBottom: "1px solid #e5e7eb"}}>
                        <div style={{ width: "140px", padding: "12px 16px", fontWeight: "bold", borderRight: "1px solid #e5e7eb" }}>수출 진행 단계</div>
                        <div style={{ flex: 1, padding: "12px 16px" }}>{product.status}</div>
                    </div>
                    <div style={{ display: "flex", flex: 1, backgroundColor: "#f9fafb"  }}>
                        <div style={{ width: "140px", padding: "12px 16px", fontWeight: "bold", borderRight: "1px solid #e5e7eb" }}>전성분</div>
                        <div style={{ flex: 1, padding: "12px 16px", fontSize: "13px", overflowY: "auto", maxHeight: "200px" }}>{product.fullIngredient || "내용 없음"}</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

// 등록/수정 모달 컴포넌트
const ModalComponent = ({ title, onClose, onSave, name, setName, category, setCategory, ingredients, setIngredients, image, onImageUpload, status, setStatus }) => (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0, 0, 0, 0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000 }} onClick={onClose}>
        <div style={{ backgroundColor: "white", borderRadius: "16px", width: "600px", maxWidth: "95%", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: "24px", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ fontSize: "18px", fontWeight: "bold", margin: 0 }}>{title}</h3>
                <X size={20} color="#6b7280" cursor="pointer" onClick={onClose} />
            </div>
            <div style={{ padding: "30px", display: "flex", flexDirection: "column", gap: "20px" }}>
                <div style={{ display: "flex", gap: "24px" }}>
                    <div style={{ width: "120px", height: "160px", backgroundColor: "#f3f4f6", borderRadius: "8px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                        <div style={{ width: "80px", height: "80px", backgroundColor: "#e5e7eb", borderRadius: "8px", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            {image ? <img src={image} alt="미리보기" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <Image color="#9ca3af" size={32} />}
                        </div>
                        <label htmlFor="image-input" style={{ padding: "6px 12px", fontSize: "12px", backgroundColor: "#fff", border: "1px solid #d1d5db", borderRadius: "6px", cursor: "pointer" }}>사진 선택</label>
                        <input id="image-input" type="file" accept="image/*" onChange={onImageUpload} style={{ display: "none" }} />
                    </div>
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "12px" }}>
                        <label style={{ fontSize: "14px", fontWeight: "bold" }}>제품명</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="제품명 입력" style={inputStyle} />
                        <label style={{ fontSize: "14px", fontWeight: "bold" }}>카테고리</label>
                        <select value={category} onChange={(e) => setCategory(e.target.value)} style={inputStyle}>
                            <option value="SKINCARE">SKINCARE</option>
                            <option value="MAKEUP">MAKEUP</option>
                            <option value="SUNSCREEN">SUNSCREEN</option>
                            <option value="BODYCARE">BODYCARE</option>
                        </select>
                        <select value={status} onChange={(e) => setStatus(e.target.value)} style={inputStyle}>
                            <option value="STEP_1">STEP_1</option>
                            <option value="STEP_2">STEP_2</option>
                            <option value="STEP_3">STEP_3</option>
                            <option value="STEP_4">STEP_4</option>
                            <option value="STEP_5">STEP_5</option>
                        </select>
                    </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <label style={{ fontSize: "14px", fontWeight: "bold" }}>전성분</label>
                    <textarea value={ingredients} onChange={(e) => setIngredients(e.target.value)} placeholder="전성분을 입력하세요" style={{ ...inputStyle, height: "100px", resize: "none" }} />
                </div>
            </div>
            <div style={{ padding: "16px 24px", borderTop: "1px solid #e5e7eb", display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                <button onClick={onClose} style={actionButtonStyle}>취소</button>
                <button onClick={onSave} style={{ ...actionButtonStyle, backgroundColor: "#111827", color: "white" }}>저장</button>
            </div>
        </div>
    </div>
);

const inputStyle = { width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px", outline: "none" };
const actionButtonStyle = { padding: "10px 20px", backgroundColor: "#f3f4f6", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: "500", cursor: "pointer", whiteSpace: "nowrap" };