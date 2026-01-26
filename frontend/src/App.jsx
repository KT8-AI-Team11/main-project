import React, { useState, useMemo } from 'react';
import { Bell, Home, Search, X, Code, MessageCircle, Image, Send, Trash2, CheckCircle, ArrowLeft, ArrowRight } from 'lucide-react';

export default function CosyUI() {
  const [showNotice, setShowNotice] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState('home');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // 상세 모달 상태 추가
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const [newProductName, setNewProductName] = useState('');
  const [newProductCategory, setNewProductCategory] = useState('');
  const [newProductImage, setNewProductImage] = useState(null);

  const [products, setProducts] = useState([
    { id: 1, name: '수분 크림 A', subtitle: '기초화장품', feature: '2024-01-10', image: null },
    { id: 2, name: '선스크린 B', subtitle: '자외선차단', feature: '2024-01-12', image: null },
    { id: 3, name: '클렌징 폼 C', subtitle: '세안제', feature: '2024-01-15', image: null },
    { id: 4, name: '비타민 세럼 D', subtitle: '에센스', feature: '2024-01-20', image: null },
  ]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => p.name.includes(searchQuery) || p.subtitle.includes(searchQuery));
  }, [products, searchQuery]);

  // 선택된 제품 정보 가져오기
  const selectedProduct = useMemo(() => {
    return products.find(p => p.id === selectedProductId);
  }, [products, selectedProductId]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProductImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const openAddModal = () => {
    setNewProductImage(null);
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
    setNewProductName('');
    setNewProductCategory('');
    setNewProductImage(null);
  };

  const confirmAddProduct = () => {
    if (!newProductName.trim()) {
      alert('제품명을 입력해주세요.');
      return;
    }
    const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
    const newProduct = {
      id: newId,
      name: newProductName,
      subtitle: newProductCategory || '미분류',
      feature: new Date().toISOString().split('T')[0],
      image: newProductImage
    };
    setProducts([...products, newProduct]);
    closeAddModal();
  };

  const openEditModal = () => {
    if (!selectedProductId) {
      alert('수정할 제품을 선택해주세요.');
      return;
    }
    const product = products.find(p => p.id === selectedProductId);
    setNewProductName(product.name);
    setNewProductCategory(product.subtitle);
    setNewProductImage(product.image);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setNewProductName('');
    setNewProductCategory('');
    setNewProductImage(null);
  };

  const confirmEditProduct = () => {
    if (!newProductName.trim()) {
      alert('제품명을 입력해주세요.');
      return;
    }
    setProducts(products.map(p =>
      p.id === selectedProductId
        ? { ...p, name: newProductName, subtitle: newProductCategory || '미분류', image: newProductImage }
        : p
    ));
    closeEditModal();
  };

  const deleteProduct = () => {
    if (!selectedProductId) return alert('삭제할 제품을 선택해주세요.');
    setProducts(products.filter(p => p.id !== selectedProductId));
    setSelectedProductId(null);
    setIsDetailModalOpen(false);
  };

  const runAnalysis = () => {
    if (!selectedProductId) return alert('분석할 제품을 선택해주세요.');
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      alert(`${products.find(p => p.id === selectedProductId).name}의 글로벌 규제 검토가 완료되었습니다. (적합)`);
    }, 2000);
  };

  // 제품 클릭 핸들러 (상세 모달 오픈)
  const handleProductClick = (id) => {
    setSelectedProductId(id);
    setIsDetailModalOpen(true);
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', backgroundColor: '#f9fafb', fontFamily: 'sans-serif', overflow: 'hidden' }}>
      <div style={{ width: '224px', backgroundColor: '#e5e7eb', padding: '24px', borderRight: '1px solid #d1d5db', overflowY: 'auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <SidebarItem active={currentPage === 'home'} onClick={() => setCurrentPage('home')} label="AI 성분 분석기" />
          <SidebarItem label="제품 검색/분석" />
          <SidebarItem active={currentPage === 'products'} onClick={() => setCurrentPage('products')} label="내 제품 관리" />
          <SidebarItem label="프로필 설정" />
          <SidebarItem label="알림 설정" />
          <SidebarItem label="국가별 규제 정보" />
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e7eb', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer' }} onClick={() => setCurrentPage('home')}>
            <Home style={{ width: '24px', height: '24px', color: '#374151' }} />
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: 0 }}>COSY</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <HeaderButton label="공지사항" />
            <HeaderButton label="최근 검색" />
            <Bell style={{ width: '24px', height: '24px', color: '#374151', cursor: 'pointer' }} />
          </div>
        </div>

        {currentPage === 'home' ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {showNotice && <Notice onClose={() => setShowNotice(false)} />}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px', overflowY: 'auto' }}>
              <div style={{ maxWidth: '600px', width: '100%', textAlign: 'center' }}>
                <h2 style={{ fontSize: '40px', fontWeight: 'bold', marginBottom: '16px', color: '#111827' }}>COSY</h2>
                <p style={{ fontSize: '18px', color: '#4b5563', marginBottom: '32px' }}>성분표 한 장으로 글로벌 규제 위반 여부를 즉시 확인하세요.</p>
                <div style={{ position: 'relative' }}>
                  <input type="text" placeholder="성분명 또는 제품명을 검색해 보세요" style={{ width: '100%', padding: '16px 56px 16px 24px', border: '2px solid #3b82f6', borderRadius: '9999px', fontSize: '16px', outline: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                  <Search style={{ position: 'absolute', right: '-60px', top: '50%', transform: 'translateY(-50%)', color: '#3b82f6' }} />
                </div>
              </div>
            </div>
            <div style={{ borderTop: '1px solid #e5e7eb', backgroundColor: 'white', padding: '20px 32px', flexShrink: 0 }}>
              <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative' }}>
                <input type="text" placeholder="분석하고 싶은 성분 파일을 업로드하거나 질문을 입력하세요." style={{ width: '100%', padding: '10px 0px 10px 10px', border: '1px solid #d1d5db', borderRadius: '12px', fontSize: '14px', outline: 'none' }} />
                <div style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: '8px' }}>
                  <InputIconButton icon={<Image size={20} />} />
                  <InputIconButton icon={<Code size={20} />} />
                  <InputIconButton icon={<Send size={20} color="#3b82f6" />} />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ flex: 1, padding: '40px', backgroundColor: '#f3f4f6', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto', width: '100%', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <h2 style={{ marginBottom: '24px', fontSize: '20px', fontWeight: 'bold' }}>내 제품 리스트 ({filteredProducts.length})</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px', flex: 1 }}>
                {filteredProducts.map((product) => (
                  <div key={product.id}
                       onClick={() => handleProductClick(product.id)}
                       style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', cursor: 'pointer', border: selectedProductId === product.id ? '2px solid #3b82f6' : '2px solid transparent', transition: 'all 0.2s', height: 'fit-content' }}>
                    <div style={{ backgroundColor: '#f3f4f6', height: '100px', borderRadius: '8px', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                      {product.image ? (
                        <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <Image color="#9ca3af" />
                      )}
                    </div>
                    <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '4px' }}>{product.name}</h3>
                    <p style={{ fontSize: '13px', color: '#6b7280' }}>{product.subtitle}</p>
                    <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '8px' }}>등록: {product.feature}</p>
                  </div>
                ))}
                <div onClick={openAddModal} style={{ backgroundColor: '#fff', borderRadius: '12px', border: '2px dashed #d1d5db', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', minHeight: '210px', height: 'fit-content' }}>
                  <span style={{ fontSize: '40px', color: '#9ca3af' }}>+</span>
                </div>
              </div>

              <div style={{ position: 'sticky', bottom: '0', display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: 'white', padding: '16px', borderRadius: '12px', boxShadow: '0 -4px 6px -1px rgba(0,0,0,0.05)', marginTop: 'auto' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                  <input type="text" placeholder="리스트 내 검색" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ width: '100%', maxWidth: '500px', padding: '10px 3px', border: '1px solid #d1d5db', borderRadius: '8px', outline: 'none' }} />
                </div>
                <button onClick={openAddModal} style={actionButtonStyle}>추가</button>
                <button onClick={openEditModal} style={actionButtonStyle}>수정</button>
                <button onClick={deleteProduct} style={{...actionButtonStyle, color: '#ef4444'}}>삭제</button>
                <button onClick={runAnalysis} disabled={isAnalyzing} style={{...actionButtonStyle, backgroundColor: '#111827', color: 'white'}}>{isAnalyzing ? '분석 중...' : '규제 검토'}</button>
              </div>
            </div>
          </div>
        )}

        {/* 챗봇 영역 */}
        <div style={{ position: 'fixed', bottom: '10px', right: '24px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px', zIndex: 1000 }}>
          {isChatOpen && (
            <div style={{ width: '300px', height: '400px', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#3b82f6', borderRadius: '16px 16px 0 0' }}>
                <span style={{ color: 'white', fontWeight: 'bold' }}>COSY AI 어시스턴트</span>
                <X size={18} color="white" cursor="pointer" onClick={() => setIsChatOpen(false)} />
              </div>
              <div style={{ flex: 1, padding: '16px', overflowY: 'auto', fontSize: '14px' }}>
                <div style={{ backgroundColor: '#f3f4f6', padding: '10px', borderRadius: '12px', marginBottom: '8px' }}>안녕하세요! 어떤 성분이 궁금하신가요?</div>
              </div>
              <div style={{ padding: '12px', borderTop: '1px solid #e5e7eb', display: 'flex', gap: '8px' }}>
                <input type="text" placeholder="메시지 입력..." style={{ flex: 1, border: 'none', outline: 'none', fontSize: '14px' }} />
                <Send size={18} color="#3b82f6" cursor="pointer" />
              </div>
            </div>
          )}
          <button onClick={() => setIsChatOpen(!isChatOpen)} style={{ width: '56px', height: '56px', backgroundColor: '#3b82f6', borderRadius: '50%', border: 'none', cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MessageCircle color="white" size={24} />
          </button>
        </div>
      </div>

      {/* 제품 상세 모달 추가 */}
      {isDetailModalOpen && selectedProduct && (
        <DetailModalComponent
          product={selectedProduct}
          onClose={() => setIsDetailModalOpen(false)}
        />
      )}

      {isAddModalOpen && (
        <ModalComponent
          title="제품 등록"
          onClose={closeAddModal}
          onSave={confirmAddProduct}
          name={newProductName} setName={setNewProductName}
          category={newProductCategory} setCategory={setNewProductCategory}
          image={newProductImage} onImageUpload={handleImageUpload}
        />
      )}

      {isEditModalOpen && (
        <ModalComponent
          title="제품 수정"
          onClose={closeEditModal}
          onSave={confirmEditProduct}
          name={newProductName} setName={setNewProductName}
          category={newProductCategory} setCategory={setNewProductCategory}
          image={newProductImage} onImageUpload={handleImageUpload}
        />
      )}
    </div>
  );
}

// 상세 정보 모달 컴포넌트 (요청하신 이미지 레이아웃 적용)
const DetailModalComponent = ({ product, onClose }) => (
  <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000 }} onClick={onClose}>
    <div style={{ backgroundColor: 'white', width: '900px', maxWidth: '95%', borderRadius: '8px', position: 'relative', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', overflow: 'hidden' }} onClick={(e) => e.stopPropagation()}>
      <X size={24} style={{ position: 'absolute', top: '24px', right: '24px', cursor: 'pointer', color: '#6b7280' }} onClick={onClose} />

      <div style={{ padding: '60px 40px', display: 'flex', gap: '40px' }}>
        {/* 좌측 이미지 섹션 */}
        <div style={{ width: '320px', height: '420px', backgroundColor: '#e5e7eb', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {product.image ? (
            <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#4b5563' }}>제품 이미지</span>
          )}
        </div>

        {/* 우측 테이블 섹션 */}
        <div style={{ flex: 1, border: '1px solid #111827', minHeight: '420px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', backgroundColor: 'white' }}>
            <div style={{ width: '140px', padding: '12px 16px', fontWeight: 'bold', borderRight: '1px solid #e5e7eb' }}>항목</div>
            <div style={{ flex: 1, padding: '12px 16px', fontWeight: 'bold' }}>내용</div>
          </div>

          <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
            <div style={{ width: '140px', padding: '12px 16px', fontWeight: 'bold', borderRight: '1px solid #e5e7eb' }}>제품명</div>
            <div style={{ flex: 1, padding: '12px 16px' }}>내용</div>
          </div>

          <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb' }}>
            <div style={{ width: '140px', padding: '12px 16px', fontWeight: 'bold', borderRight: '1px solid #e5e7eb' }}>
                <div style={{ fontSize: '15px' }}>{product.name}</div>
                <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 'normal' }}>{product.subtitle}</div>
                <div style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 'normal', marginTop: '4px' }}>등록: {product.feature}</div>
            </div>
            <div style={{ flex: 1, padding: '12px 16px' }}>
                <div style={{ fontSize: '15px', fontWeight: 'bold' }}>수분크림 B</div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>기초화장품</div>
                <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>2024-01-01 15:12</div>
            </div>
          </div>

          <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
            <div style={{ width: '140px', padding: '12px 16px', fontWeight: 'bold', borderRight: '1px solid #e5e7eb' }}>케미트루</div>
            <div style={{ flex: 1, padding: '12px 16px' }}>25개 (12개 위험)</div>
          </div>

          <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb' }}>
            <div style={{ width: '140px', padding: '12px 16px', fontWeight: 'bold', borderRight: '1px solid #e5e7eb' }}>성분 등록</div>
            <div style={{ flex: 1, padding: '12px 16px' }}>카테고리 여부</div>
          </div>

          <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
            <div style={{ width: '140px', padding: '12px 16px', fontWeight: 'bold', borderRight: '1px solid #e5e7eb' }}>규제 등록</div>
            <div style={{ flex: 1, padding: '12px 16px' }}></div>
          </div>

          <div style={{ display: 'flex', backgroundColor: '#f9fafb', flex: 1 }}>
            <div style={{ width: '140px', padding: '12px 16px', fontWeight: 'bold', borderRight: '1px solid #e5e7eb' }}>규제 수수 여부</div>
            <div style={{ flex: 1, padding: '12px 16px' }}></div>
          </div>
        </div>
      </div>

      {/* 하단 화살표 네비게이션 */}
      <div style={{ padding: '0 40px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <ArrowLeft size={24} style={{ color: '#d1d5db', cursor: 'not-allowed' }} />
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '18px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>M</div>
        <ArrowRight size={24} style={{ color: '#111827', cursor: 'pointer' }} />
      </div>
    </div>
  </div>
);

const SidebarItem = ({ label, active, onClick }) => (
  <div onClick={onClick} style={{ fontSize: '14px', color: active ? '#111827' : '#4b5563', padding: '10px 12px', cursor: 'pointer', borderRadius: '8px', backgroundColor: active ? '#d1d5db' : 'transparent', fontWeight: active ? '600' : '400' }}>{label}</div>
);
const HeaderButton = ({ label }) => (
  <button style={{ padding: '8px 12px', fontSize: '14px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#4b5563' }}>{label}</button>
);
const Notice = ({ onClose }) => (
  <div style={{ padding: '24px 32px', flexShrink: 0 }}>
    <div style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: 'white', border: '1px solid #3b82f6', borderRadius: '12px', padding: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1d4ed8' }}><CheckCircle size={18} /><h3 style={{ fontSize: '14px', fontWeight: 'bold', margin: 0 }}>이용 약관 및 규제 업데이트 안내</h3></div>
        <X size={16} color="#6b7280" cursor="pointer" onClick={onClose} />
      </div>
      <p style={{ fontSize: '13px', color: '#4b5563', marginLeft: '26px', marginBottom: '12px' }}>유럽(EU) 및 북미(MoCRA) 화장품 규정 변경에 따른 성분 분석 알고리즘이 업데이트되었습니다.</p>
    </div>
  </div>
);
const InputIconButton = ({ icon }) => (
  <button style={{ padding: '8px', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</button>
);
const ModalComponent = ({ title, onClose, onSave, name, setName, category, setCategory, image, onImageUpload }) => (
  <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }} onClick={onClose}>
    <div style={{ backgroundColor: 'white', borderRadius: '16px', width: '500px', maxWidth: '90%', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)' }} onClick={(e) => e.stopPropagation()}>
      <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>{title}</h3>
        <X size={20} color="#6b7280" cursor="pointer" onClick={onClose} />
      </div>
      <div style={{ padding: '50px', display: 'flex', gap: '24px' }}>
        <div style={{ width: '120px', height: '160px', backgroundColor: '#f3f4f6', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', flexShrink: 0 }}>
          <div style={{ width: '80px', height: '80px', backgroundColor: '#e5e7eb', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            {image ? <img src={image} alt="미리보기" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Image color="#9ca3af" size={32} />}
          </div>
          <label htmlFor="image-input" style={{ padding: '6px 12px', fontSize: '12px', backgroundColor: '#fff', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer' }}>사진 업로드</label>
          <input id="image-input" type="file" accept="image/*" onChange={onImageUpload} style={{ display: 'none' }} />
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', display: 'block', marginBottom: '8px' }}>제품명</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="제품명을 입력하세요" style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', outline: 'none' }} />
          </div>
          <div>
            <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', display: 'block', marginBottom: '8px' }}>카테고리</label>
            <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="카테고리를 입력하세요" style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', outline: 'none' }} />
          </div>
        </div>
      </div>
      <div style={{ padding: '16px 24px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
        <button onClick={onClose} style={{ padding: '8px 16px', fontSize: '14px', backgroundColor: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>취소</button>
        <button onClick={onSave} style={{ padding: '8px 16px', fontSize: '14px', backgroundColor: '#111827', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>저장</button>
      </div>
    </div>
  </div>
);
const actionButtonStyle = { padding: '10px 20px', backgroundColor: '#f3f4f6', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer', whiteSpace: 'nowrap' };