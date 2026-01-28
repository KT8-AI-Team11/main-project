import React, { useMemo, useState, useEffect } from "react";
import { Image, X, ArrowLeft, ArrowRight } from "lucide-react";
import axios from "axios";

// 임시 토큰
// const ACCESS_TOKEN = localStorage.getItem("token");
const ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJmcm9udEB0ZXN0LmNvbSIsImNvbXBhbnlJZCI6MTQsImlhdCI6MTc2OTU5NjkyNiwiaXNzIjoiY29zeSIsImV4cCI6MTc2OTYwNzcyNn0.L13aExynqYrDmCVx7WRDr5lzFhPx9BDek9FzEpZNQRU";

const api = axios.create({
    baseURL: "http://localhost:8080/api",
    headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json",
    },
});

export default function ProductsPage() {
    const [products, setProducts] = useState([]);

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedProductId, setSelectedProductId] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    const [newProductName, setNewProductName] = useState("");
    const [newProductCategory, setNewProductCategory] = useState("");
    const [newProductImage, setNewProductImage] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            console.log("1. 요청 시작..."); // 실행 여부 확인
            try {
                // 주소를 절대 경로로 써서 확실하게 요청해봅니다.
                const response = await axios.get("http://localhost:8080/api/products", {
                    headers: {
                        Authorization: `Bearer ${ACCESS_TOKEN}`
                    }
                });

                console.log("2. 서버 응답 성공:", response.data); // 데이터 구조 확인

                if (response.data) {
                    setProducts(response.data);
                    console.log("3. 상태 업데이트 완료");
                }
            } catch (error) {
                console.error("4. 에러 발생!");
                if (error.response) {
                    // 에러 확인
                    console.error("에러 상태코드:", error.response.status);
                    console.error("에러 메시지:", error.response.data);
                } else {
                    console.error("서버 연결 실패 (네트워크 확인)");
                }
            }
        };
        fetchProducts();
    }, []);

    // 4. 제품 등록 로직
    const confirmAddProduct = async () => {
        if (!newProductName.trim()) return alert("제품명을 입력해주세요.");

        const payload = {
            name: newProductName,
            subtitle: newProductCategory || "미분류",
        };

        try {
            const response = await api.post("/products", payload);
            // 백엔드에서 생성된 객체를 반환하므로 목록에 바로 추가
            setProducts([...products, response.data]);
            setIsAddModalOpen(false);
            setNewProductName("");
            setNewProductCategory("");
        } catch (error) {
            console.error("등록 에러:", error);
            alert("제품 등록 중 오류가 발생했습니다.");
        }
    };


    const deleteProduct = async () => {
        if (!selectedProductId) return alert("삭제할 제품을 선택해주세요.");

        try {
            await api.delete(`/products/${selectedProductId}`);
            setProducts(products.filter((p) => p.id !== selectedProductId));
            setSelectedProductId(null);
            setIsDetailModalOpen(false);
        } catch (error) {
            alert("삭제 실패!");
        }
    };

    // const filteredProducts = useMemo(() => {
    //   return products.filter((p) => p.name.includes(searchQuery) || p.subtitle.includes(searchQuery));
    // }, [products, searchQuery]);
    const filteredProducts = useMemo(() => {
        return products.filter((p) =>
            p.name.includes(searchQuery) ||
            (p.type && p.type.includes(searchQuery)) // subtitle -> type으로 변경
        );
    }, [products, searchQuery]);


    const selectedProduct = useMemo(() => {
        return products.find((p) => p.id === selectedProductId);
    }, [products, selectedProductId]);

    const handleImageUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => setNewProductImage(reader.result);
        reader.readAsDataURL(file);
    };

    const openAddModal = () => {
        setNewProductImage(null);
        setIsAddModalOpen(true);
    };

    // const confirmAddProduct = () => {
    //   if (!newProductName.trim()) return alert("제품명을 입력해주세요.");
    //   const newId = products.length > 0 ? Math.max(...products.map((p) => p.id)) + 1 : 1;
    //
    //   setProducts([
    //     ...products,
    //     {
    //       id: newId,
    //       name: newProductName,
    //       subtitle: newProductCategory || "미분류",
    //       feature: new Date().toISOString().split("T")[0],
    //       image: newProductImage,
    //     },
    //   ]);
    //
    //   setIsAddModalOpen(false);
    //   setNewProductName("");
    //   setNewProductCategory("");
    //   setNewProductImage(null);
    // };

    const openEditModal = () => {
        if (!selectedProductId) return alert("수정할 제품을 선택해주세요.");
        const p = products.find((x) => x.id === selectedProductId);
        setNewProductName(p.name);
        setNewProductCategory(p.subtitle);
        setNewProductImage(p.image);
        setIsEditModalOpen(true);
    };

    const confirmEditProduct = () => {
        if (!newProductName.trim()) return alert("제품명을 입력해주세요.");
        setProducts(
            products.map((p) =>
                p.id === selectedProductId ? { ...p, name: newProductName, subtitle: newProductCategory || "미분류", image: newProductImage } : p
            )
        );
        setIsEditModalOpen(false);
    };

    // const deleteProduct = () => {
    //   if (!selectedProductId) return alert("삭제할 제품을 선택해주세요.");
    //   setProducts(products.filter((p) => p.id !== selectedProductId));
    //   setSelectedProductId(null);
    //   setIsDetailModalOpen(false);
    // };

    const runAnalysis = () => {
        if (!selectedProductId) return alert("분석할 제품을 선택해주세요.");
        setIsAnalyzing(true);
        setTimeout(() => {
            setIsAnalyzing(false);
            alert(`${products.find((p) => p.id === selectedProductId).name}의 글로벌 규제 검토가 완료되었습니다. (적합)`);
        }, 1200);
    };

    const handleProductClick = (id) => {
        setSelectedProductId(id);
        setIsDetailModalOpen(true);
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
                            onClick={() => handleProductClick(product.id)}
                            style={{
                                backgroundColor: "white",
                                borderRadius: "12px",
                                padding: "20px",
                                boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                                cursor: "pointer",
                                border: selectedProductId === product.id ? "2px solid #3b82f6" : "2px solid transparent",
                                transition: "all 0.2s",
                                height: "fit-content",
                            }}
                        >
                            <div style={{ backgroundColor: "#f3f4f6", height: "100px", borderRadius: "8px", marginBottom: "12px", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                                {product.image ? <img src={product.image} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <Image color="#9ca3af" />}
                            </div>
                            <h3 style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "4px" }}>{product.name}</h3>
                            <p style={{ fontSize: "13px", color: "#6b7280" }}>{product.type}</p>
                            <p style={{ fontSize: "12px", color: "#9ca3af", marginTop: "8px" }}>등록: {product.regDate ? product.regDate.split('T')[0] : "-"}</p>
                        </div>
                    ))}

                    <div onClick={openAddModal} style={{ backgroundColor: "#fff", borderRadius: "12px", border: "2px dashed #d1d5db", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", minHeight: "210px", height: "fit-content" }}>
                        <span style={{ fontSize: "40px", color: "#9ca3af" }}>+</span>
                    </div>
                </div>

                <div style={{ position: "sticky", bottom: "0", display: "flex", alignItems: "center", gap: "12px", backgroundColor: "white", padding: "16px", borderRadius: "12px", boxShadow: "0 -4px 6px -1px rgba(0,0,0,0.05)", marginTop: "auto" }}>
                    <div style={{ flex: 1, position: "relative" }}>
                        <input
                            type="text"
                            placeholder="리스트 내 검색"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ width: "100%", maxWidth: "500px", padding: "10px 3px", border: "1px solid #d1d5db", borderRadius: "8px", outline: "none" }}
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

            {isDetailModalOpen && selectedProduct && (
                <DetailModalComponent product={selectedProduct} onClose={() => setIsDetailModalOpen(false)} />
            )}

            {isAddModalOpen && (
                <ModalComponent
                    title="제품 등록"
                    onClose={() => setIsAddModalOpen(false)}
                    onSave={confirmAddProduct}
                    name={newProductName}
                    setName={setNewProductName}
                    category={newProductCategory}
                    setCategory={setNewProductCategory}
                    image={newProductImage}
                    onImageUpload={handleImageUpload}
                />
            )}

            {isEditModalOpen && (
                <ModalComponent
                    title="제품 수정"
                    onClose={() => setIsEditModalOpen(false)}
                    onSave={confirmEditProduct}
                    name={newProductName}
                    setName={setNewProductName}
                    category={newProductCategory}
                    setCategory={setNewProductCategory}
                    image={newProductImage}
                    onImageUpload={handleImageUpload}
                />
            )}
        </div>
    );
}

const DetailModalComponent = ({ product, onClose }) => (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0, 0, 0, 0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 3000 }} onClick={onClose}>
        <div style={{ backgroundColor: "white", width: "900px", maxWidth: "95%", borderRadius: "8px", position: "relative", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)", overflow: "hidden" }} onClick={(e) => e.stopPropagation()}>
            <X size={24} style={{ position: "absolute", top: "24px", right: "24px", cursor: "pointer", color: "#6b7280" }} onClick={onClose} />

            <div style={{ padding: "60px 40px", display: "flex", gap: "40px" }}>
                <div style={{ width: "320px", height: "420px", backgroundColor: "#e5e7eb", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {product.image ? <img src={product.image} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: "20px", fontWeight: "bold", color: "#4b5563" }}>제품 이미지</span>}
                </div>

                <div style={{ flex: 1, border: "1px solid #111827", minHeight: "420px", display: "flex", flexDirection: "column" }}>
                    <div style={{ display: "flex", borderBottom: "1px solid #e5e7eb", backgroundColor: "white" }}>
                        <div style={{ width: "140px", padding: "12px 16px", fontWeight: "bold", borderRight: "1px solid #e5e7eb" }}>항목</div>
                        <div style={{ flex: 1, padding: "12px 16px", fontWeight: "bold" }}>내용</div>
                    </div>

                    <div style={{ display: "flex", borderBottom: "1px solid #e5e7eb", backgroundColor: "#f9fafb" }}>
                        <div style={{ width: "140px", padding: "12px 16px", fontWeight: "bold", borderRight: "1px solid #e5e7eb" }}>제품명</div>
                        <div style={{ flex: 1, padding: "12px 16px" }}>{product.name}</div>
                    </div>

                    <div style={{ display: "flex", borderBottom: "1px solid #e5e7eb" }}>
                        <div style={{ width: "140px", padding: "12px 16px", fontWeight: "bold", borderRight: "1px solid #e5e7eb" }}>카테고리</div>
                        <div style={{ flex: 1, padding: "12px 16px" }}>{product.subtitle}</div>
                    </div>

                    <div style={{ display: "flex", borderBottom: "1px solid #e5e7eb", backgroundColor: "#f9fafb" }}>
                        <div style={{ width: "140px", padding: "12px 16px", fontWeight: "bold", borderRight: "1px solid #e5e7eb" }}>등록일</div>
                        <div style={{ flex: 1, padding: "12px 16px" }}>{product.feature}</div>
                    </div>

                    <div style={{ display: "flex", backgroundColor: "#f9fafb", flex: 1 }}>
                        <div style={{ width: "140px", padding: "12px 16px", fontWeight: "bold", borderRight: "1px solid #e5e7eb" }}>규제 수수 여부</div>
                        <div style={{ flex: 1, padding: "12px 16px" }} />
                    </div>
                </div>
            </div>

            <div style={{ padding: "0 40px 30px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <ArrowLeft size={24} style={{ color: "#d1d5db", cursor: "not-allowed" }} />
                <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "bold", fontSize: "18px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
                    M
                </div>
                <ArrowRight size={24} style={{ color: "#111827", cursor: "pointer" }} />
            </div>
        </div>
    </div>
);

const ModalComponent = ({ title, onClose, onSave, name, setName, category, setCategory, image, onImageUpload }) => (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0, 0, 0, 0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000 }} onClick={onClose}>
        <div style={{ backgroundColor: "white", borderRadius: "16px", width: "500px", maxWidth: "90%", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: "24px", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ fontSize: "18px", fontWeight: "bold", margin: 0 }}>{title}</h3>
                <X size={20} color="#6b7280" cursor="pointer" onClick={onClose} />
            </div>

            <div style={{ padding: "50px", display: "flex", gap: "24px" }}>
                <div style={{ width: "120px", height: "160px", backgroundColor: "#f3f4f6", borderRadius: "8px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "8px", flexShrink: 0 }}>
                    <div style={{ width: "80px", height: "80px", backgroundColor: "#e5e7eb", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                        {image ? <img src={image} alt="미리보기" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <Image color="#9ca3af" size={32} />}
                    </div>
                    <label htmlFor="image-input" style={{ padding: "6px 12px", fontSize: "12px", backgroundColor: "#fff", border: "1px solid #d1d5db", borderRadius: "6px", cursor: "pointer" }}>
                        사진 업로드
                    </label>
                    <input id="image-input" type="file" accept="image/*" onChange={onImageUpload} style={{ display: "none" }} />
                </div>

                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div>
                        <label style={{ fontSize: "14px", fontWeight: "500", color: "#374151", display: "block", marginBottom: "8px" }}>제품명</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="제품명을 입력하세요" style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px", outline: "none" }} />
                    </div>

                    <div>
                        <label style={{ fontSize: "14px", fontWeight: "500", color: "#374151", display: "block", marginBottom: "8px" }}>카테고리</label>
                        <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="카테고리를 입력하세요" style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px", outline: "none" }} />
                    </div>
                </div>
            </div>

            <div style={{ padding: "16px 24px", borderTop: "1px solid #e5e7eb", display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                <button onClick={onClose} style={{ padding: "8px 16px", fontSize: "14px", backgroundColor: "#f3f4f6", color: "#374151", border: "none", borderRadius: "8px", cursor: "pointer" }}>
                    취소
                </button>
                <button onClick={onSave} style={{ padding: "8px 16px", fontSize: "14px", backgroundColor: "#111827", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" }}>
                    저장
                </button>
            </div>
        </div>
    </div>
);

const actionButtonStyle = { padding: "10px 20px", backgroundColor: "#f3f4f6", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: "500", cursor: "pointer", whiteSpace: "nowrap" };
