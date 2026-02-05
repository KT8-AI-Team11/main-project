import React, { useState } from 'react';
import {
    Globe, ChevronRight, Book, AlertTriangle, FileText, CheckCircle,
    Ship, Clock, Download, Calendar, Bell, TrendingUp, X, ExternalLink,
    Building2, ClipboardList, Shield, Users, MapPin, Info
} from 'lucide-react';

export default function ImprovedCountryRegulations() {
    const [selectedCountry, setSelectedCountry] = useState(null);
    const [selectedRegulation, setSelectedRegulation] = useState(null);

    // 국가별 상세 데이터
    const countriesData = {
        '미국': {
            flag: '🇺🇸',
            color: '#3B82F6',
            fullName: 'United States of America',
            authority: 'FDA (Food and Drug Administration)',
            marketSize: '$93.7B',
            marketGrowth: '+4.2% YoY',
            overview: '미국은 세계 최대의 화장품 시장으로, FDA의 MoCRA 법안에 따라 규제가 강화되었습니다. 2026년부터는 단순 등록을 넘어 안전성 실증(Safety Substantiation) 자료의 상시 비치와 실사와 같은 사후 관리가 핵심입니다.',
            keyFeatures: [
                '안전성 실증 의무화',
                '중대한 부작용 보고',
                '알레르기 유발 성분 표기',
                '강제 회수 권한'
            ],
            regulations: [
                {
                    id: 1,
                    title: 'MoCRA 시설 등록 및 제품 목록 제출',
                    category: '필수',
                    priority: 'high',
                    description: '2024년 7월 1일부터 본격적인 집행이 시작되었습니다. 신규 제품은 시장 출시 후 120일 이내에 등록을 마쳐야 합니다.',
                    timeline: '즉시',
                    cost: '무료',
                    requirements: [
                        'FDA 온라인 시스템(Cosmetics Direct) 계정 생성',
                        '시설 정보 등록 (주소, 연락처, 미국 내 대리인 정보 등)',
                        '제조 활동 유형 선택',
                        '연간 갱신 및 정보 변경 시 업데이트 필수'
                    ],
                    documents: ['시설 정보 (영문 주소 및 FEU 번호 등)', '제조업 허가증', '책임자(Responsible Person) 정보 및 연락처'],
                    links: ['https://www.fda.gov/cosmetics/registration-listing-cosmetic-product-facilities-and-products']
                },
                {
                    id: 2,
                    title: 'VCRP 자발적 등록 (시스템 종료 및 통합)',
                    category: '필수',
                    priority: 'high',
                    description: '기존의 VCRP는 2023년 3월에 공식 종료되었습니다. 현재는 MoCRA 시스템(Cosmetics Direct)을 통한 등록이 법적 의무가 되면서 일원화되었습니다.',
                    timeline: '제품 출시 전',
                    cost: '무료',
                    requirements: [
                        '제품명 및 브랜드 정보',
                        '전성분 목록 (INCI 명칭 준수)',
                        '제품 카테고리 분류 (FDA 분류 코드 기준)',
                        '제조사 및 판매자 정보'
                    ],
                    documents: ['제품 포뮬라 (성분 배합비)', '전성분 리스트', '제품 라벨 (Labeling) 견본'],
                    links: ['https://www.fda.gov/cosmetics/registration-listing-cosmetic-product-facilities-and-products/cosmetics-direct']
                },
                {
                    id: 3,
                    title: '화장품 GMP 준수',
                    category: '권장',
                    priority: 'medium',
                    description: '현재 FDA가 구체적인 화장품 GMP 기준을 수립 중이며, 2026년 중에 최종안이 발표될 예정입니다. 현재는 권장 사항이나, 향후 의무화될 가능성이 매우 높습니다.',
                    timeline: '지속적',
                    cost: '$2,000 - $10,000 (법률 자문)',
                    requirements: [
                        '과학적 근거가 있는 효능 주장 (Claims)',
                        '소비자가 오해할 소지가 없는 표현 사용',
                        '비포/애프터 사진 사용 시 정확한 연출 및 표현',
                        '추천사(Testimonials)의 진정성 보장'
                    ],
                    documents: ['효능 입증 자료 (Clinical Studies 등)', '임상 시험 결과 보고서', '광고 검토 의견서 (Compliance Review)'],
                    links: ['https://www.ftc.gov/business-guidance/resources/advertising-faqs-guide-small-business']
                }
            ],
            roadmap: [
                { step: 1, title: 'FEI 번호 확보', duration: '1주', status: 'start' },
                { step: 2, title: '시설 등록 (Facility Registration)', duration: '1주', status: 'process' },
                { step: 3, title: '제품 목록 제출 (Product Listing)', duration: '1주', status: 'process' },
                { step: 4, title: '안전성 실증 서류(Dossier) 작성', duration: '2-3주', status: 'optional' },
                { step: 5, title: '라벨 검토 및 부작용 연락처 기재', duration: '1주', status: 'verify' },
                { step: 6, title: '수출 개시', duration: '-', status: 'complete' }
            ],
            estimatedTime: '2-4주',
            estimatedCost: '$3,000 - $8,000',
            requiredDocuments: [
                '제품 목록 (Product Listing)',
                '안전성 실증 자료 (Safety Substantiation Dossier)',
                '라벨 시안 (영문)',
                '시설 등록 증명서 (FEI 번호)',
                '부작용 보고 기록 관리 대장'
            ],
            alerts: [
                {
                    type: 'warning',
                    title: 'MoCRA 사후 관리 및 실사 강화',
                    content: 'FDA는 2026년부터 안전성 실증 자료 및 부작용 기록에 대한 현장 실사와 모니터링을 강화한다고 발표했습니다.',
                    date: '2026-01-15'
                },
                {
                    type: 'info',
                    title: '향료 알레르기 성분 공시 임박',
                    content: 'FDA는 2026년 5월까지 라벨에 표기해야 할 알레르기 유발 성분 리스트를 확정할 예정입니다.',
                    date: '2026-01-20'
                }
            ]
        },
        '유럽연합': {
            flag: '🇪🇺',
            color: '#8B5CF6',
            fullName: 'European Union',
            authority: 'European Commission',
            marketSize: '€119.1B',
            marketGrowth: '+4.0% YoY',
            overview: 'EU는 세계에서 가장 엄격한 화장품 규제를 시행하며, Regulation (EC) No 1223/2009에 따라 관리됩니다. 2026년부터는 마이크로플라스틱 금지와 PFAS 단계적 퇴출 등 환경 규제가 제품 설계 단계부터 필수적으로 고려되어야 합니다.',
            keyFeatures: [
                '안전성 평가 보고서(CPSR) 강화',
                '동물 실험 전면 금지',
                '나노물질 통지 의무',
                '라벨링 규정 준수'
            ],
            regulations: [
                {
                    id: 1,
                    title: 'Annex II 금지 성분 검토 및 RP 지정',
                    category: '필수',
                    priority: 'high',
                    description: 'EU 내에서 제품에 대한 법적 책임을 지는 법인 또는 개인을 지정하는 것이 필수적입니다.',
                    timeline: '수출 전 필수',
                    cost: '€2,000 - €5,000/년',
                    requirements: [
                        'EU 소재 법인 또는 개인 지정',
                        '화장품 안전성 평가 능력 보유',
                        'PIF(제품 정보 파일) 관리 책임',
                        '제품 리콜 권한 보유'
                    ],
                    documents: ['RP 계약서', '사업자 등록증', '책임보험 증명'],
                    links: ['https://single-market-economy.ec.europa.eu/sectors/cosmetics/legislation_en']
                },
                {
                    id: 2,
                    title: 'CPSR 및 PIF 보관',
                    category: '필수',
                    priority: 'high',
                    description: 'Cosmetic Product Safety Report(CPSR)는 필수 문서로, 반드시 독성학자 등 전문가가 작성해야 합니다.',
                    timeline: '4-8주',
                    cost: '€1,500 - €5,000',
                    requirements: [
                        '제품 설명 및 의도된 용도 명시',
                        '안전성 평가 결론 포함',
                        '라벨 표시 사항 및 경고문 확인',
                        '독성학자 또는 의사의 서명 필수'
                    ],
                    documents: ['제품 포뮬라 (성분 배합비)', '원료 MSDS (물질안전보건자료)', '안정성 시험 자료', 'CoA (시험성적서)'],
                    links: ['https://health.ec.europa.eu/scientific-committees/scientific-committee-consumer-safety-sccs_en']
                },
                {
                    id: 3,
                    title: '환경 규제(PPWR) 및 PIF 유지',
                    category: '필수',
                    priority: 'high',
                    description: 'Product Information File(PIF)은 제품의 모든 정보를 담은 문서로, 마지막 배치 출시 후 10년간 보관해야 합니다.',
                    timeline: '3-6주',
                    cost: '€500 - €2,000',
                    requirements: [
                        '제품 설명 및 안전성 평가 데이터',
                        '제조 방법 및 GMP(우수제조관리기준) 적합성',
                        '효능 입증 자료 (Claims)',
                        '동물실험 데이터 (있는 경우 포함)'
                    ],
                    documents: ['CPSR (화장품 안전성 보고서)', 'GMP 인증서', '효능 입증 자료', '공정 흐름도'],
                    links: ['https://single-market-economy.ec.europa.eu/sectors/cosmetics/legislation_en']
                },
            ],
            roadmap: [
                { step: 1, title: 'RP(Responsible Person) 지정', duration: '1주', status: 'start' },
                { step: 2, title: '성분 검토 (Annex II-VI)', duration: '3주', status: 'process' },
                { step: 3, title: 'PIF(제품 정보 파일) 작성', duration: '4주', status: 'process' },
                { step: 4, title: 'CPSR 평가', duration: '4주', status: 'process' },
                { step: 5, title: 'CPNP 포털 등록', duration: '1주', status: 'process' },
                { step: 6, title: '라벨 검토 및 최종 승인', duration: '2주', status: 'verify' },
                { step: 7, title: '수출 개시', duration: '-', status: 'complete' }
            ],
            estimatedTime: '12-16주',
            estimatedCost: '€8,000 - €15,000',
            requiredDocuments: [
                'CPSR (화장품 안전성 보고서)',
                'PIF (제품 정보 파일)',
                '성분 분석표 (CoA)',
                '나노물질 통지서',
                'MSDS (물질안전보건자료)'
            ],
            alerts: [
                {
                    type: 'alert',
                    title: 'PFAS 성분 사용 전면 금지',
                    content: 'EU REACH 규정에 따라 화장품 내 모든 PFAS(과불화화합물) 성분의 시장 출시가 금지될 예정이므로 즉각적인 성분 교체가 필요합니다.',
                    date: '2026-01-28'
                },
                {
                    type: 'warning',
                    title: '실리콘계 물질(D4, D5, D6) 제한 강화',
                    content: '린스 오프(세정형) 제품 내 D6 농도가 0.1%로 제한되며, 관련 과도기가 종료됩니다.',
                    date: '2026-01-22'
                },
                {
                    type: 'info',
                    title: '마이크로플라스틱 규제 단계적 확대',
                    content: '의도적으로 첨가된 미세플라스틱에 대한 제한이 본격화되며, 특정 제품군별 유예기간을 준수해야 합니다.',
                    date: '2026-01-22'
                }
            ]
        },
        '중국': {
            flag: '🇨🇳',
            color: '#EF4444',
            fullName: 'People\'s Republic of China',
            authority: 'NMPA (National Medical Products Administration)',
            marketSize: '$82.1B',
            marketGrowth: '+7.4% YoY',
            overview: '중국은 세계 2위의 화장품 시장으로, NMPA의 CSAR(화장품감독관리조례)에 따라 엄격한 규제를 받습니다. 2026년부터 전자라벨 시범사업이 본격화되었으며, 단순 신고제를 넘어 제품의 안전성 평가 보고서(전성분) 제출이 필수화되었습니다.',
            keyFeatures: [
                '전자라벨(QR코드) 시범 운영',
                '특수 화장품 범위 축소',
                '동물실험 면제 확대',
                '원료 안전 정보 제출'
            ],
            regulations: [
                {
                    id: 1,
                    title: '수입업자 및 책임자 지정',
                    category: '필수',
                    priority: 'high',
                    description: '중국 내 수입업 허가를 보유한 법인을 경내책임자로 선임해야 하며, 이 책임자는 제품의 품질, 안전 및 온라인 신고 시스템 관리에 대한 책임을 집니다.',
                    timeline: '수출 전 필수',
                    cost: 'RMB 30,000 - 50,000/년',
                    requirements: [
                        '중국 내 수입업 허가를 보유한 법인 선임',
                        '화장품 수입 및 유통 경험 보유',
                        '창고 및 품질관리 시설 확보 여부 확인',
                        '제품 리콜 및 안전 이슈 발생 시 대응 능력'
                    ],
                    documents: ['수입업 허가증 (중국 법인)', '사업자 등록증 (영문 및 중문)', '창고 계약서 또는 관리 증명', '경내책임자 위탁 수권서 (공증 필수)'],
                    links: ['https://english.nmpa.gov.cn/cosmetics.html']
                },
                {
                    id: 2,
                    title: 'NMPA 성분 검토 (CSAR)',
                    category: '필수',
                    priority: 'high',
                    description: 'NMPA가 승인한 성분 리스트(IECIC)를 기준으로 사용 제한 또는 금지 성분 여부를 사전에 철저히 검토해야 합니다.',
                    timeline: '4-6주',
                    cost: 'RMB 10,000 - 20,000',
                    requirements: [
                        'NMPA 기사용 화장품 원료 목록(IECIC) 확인',
                        '사용 제한 성분의 함량 준수 여부 검토',
                        '금지 성분 포함 여부 확인',
                        '안전성 모니터링이 필요한 신원료 등록 여부 판단'
                    ],
                    documents: ['전성분 리스트 (중문 표준 명칭 및 함량 포함)', '원료 MSDS (물질안전보건자료)', 'CoA (원료 시험성적서)'],
                    links: ['https://hzpsys.nifdc.org.cn/hzpGS/ysyhzpylml#']
                },
                {
                    id: 3,
                    title: '일반(비특수) 화장품 신고',
                    category: '필수',
                    priority: 'high',
                    description: '세정, 보습 등 일반적인 용도의 화장품은 온라인 시스템을 통해 제품 정보를 등록하고 바로 수입이 가능하나, 사후 심사가 엄격합니다.',
                    timeline: '3-6개월',
                    cost: 'RMB 50,000 - 100,000',
                    requirements: [
                        '제품 안전성 평가 자료 제출',
                        '생산국(한국 등)의 생산판매 증명서 확보',
                        '온라인 신고 시스템을 통한 서류 제출',
                        '중국 내 경내책임자 지정 및 ID 발급'
                    ],
                    documents: ['안전성 평가 보고서', 'ISO 22716 또는 GMP 인증서', '자유 판매 증명서 (Certificate of Free Sale)', '제품 포뮬라 및 제조 공정도'],
                    links: ['https://zwfw.nmpa.gov.cn/web/user/login']
                },
                {
                    id: 4,
                    title: '동물실험 면제 신청',
                    category: '권장',
                    priority: 'medium',
                    description: '정부가 인증한 GMP(ISO 22716 등) 체계 하에서 생산되고 안전성이 입증된 경우 동물실험 보고서 제출을 면제해 줍니다.',
                    timeline: '2-4주',
                    cost: 'RMB 20,000 - 40,000',
                    requirements: [
                        '정부 기관 발행 GMP 인증서(ISO 22716 등) 보유',
                        '원료 및 완제품의 안전성 입증 자료 구비',
                        '영유아/어린이용 제품이 아닐 것 (면제 제외 대상)',
                        '제품 안전성 평가 보고서의 "전체 평점" 확보'
                    ],
                    documents: ['ISO 22716 인증서', '안전성 평가서', '원료 안전성 관련 자료 (MSDS 등)', '생산판매 증명서'],
                    links: ['http://www.nmpa.gov.cn']
                },
                {
                    id: 5,
                    title: '전자 라벨(QR코드) 활용',
                    category: '필수',
                    priority: 'high',
                    description: '제품 포장 공간의 제약을 해결하기 위해 QR코드를 스캔하면 전성분, 주의사항 등 상세 정보를 중문으로 확인할 수 있어야 합니다.',
                    timeline: '4-8주',
                    cost: 'RMB 5,000 - 15,000',
                    requirements: [
                        '중문 제품명 및 원어 제품명 병기',
                        '전성분 표시 (INCI 및 중문 표준 명칭)',
                        '제조일자, 유통기한 및 제조번호 명시',
                        '사용 방법 및 주의사항 중문 번역',
                        'NMPA 허가/신고된 효능만 표기 가능'
                    ],
                    documents: ['라벨 디자인(안) 및 포장 이미지', '전성분 중문 번역본 및 명명 근거', '효능 표현 검토서 (Claims Substantiation)'],
                    links: ['https://www.zmuni.com/ko/news/2026/']
                }
            ],
            roadmap: [
                { step: 1, title: '경내책임자 지정', duration: '2주', status: 'start' },
                { step: 2, title: '성분 검토 및 원료 코드 확보', duration: '4주', status: 'process' },
                { step: 3, title: '동물실험 면제 신청 및 안전성 평가', duration: '4주', status: 'optional' },
                { step: 4, title: '제품 신고 및 기술 심사', duration: '12주', status: 'process' },
                { step: 5, title: '전자라벨 제작 및 승인', duration: '6주', status: 'process' },
                { step: 6, title: '통관 및 검역', duration: '2주', status: 'verify' },
                { step: 7, title: '수출 개시', duration: '-', status: 'complete' }
            ],
            estimatedTime: '4-7개월',
            estimatedCost: 'RMB 80,000 - 150,000',
            requiredDocuments: [
                '제품 포뮬러 및 생산공정 (원료별 코드 포함)',
                'ISO 22716 또는 CGMP 인증서 (원본)',
                '제품 안전성 평가 보고서 (Full Version 필수)',
                '전자라벨 및 패키지 디자인 시안',
                '경내책임자 수권서 및 사업자등록증',
                '효능 입증 자료 (미백, 자외선 차단 등 특수 효능 시)'
            ],
            alerts: [
                {
                    type: 'warning',
                    title: '전자라벨링 제도 시행',
                    content: 'NMPA 지침에 따라 제품 포장에 QR코드를 부착하여 성분 및 효능 정보를 대체할 수 있는 시범 사업이 시작되었습니다.',
                    date: '2026-01-25'
                },
                {
                     type: 'alert',
                     title: '특정 성분 사용 제한 업데이트',
                     content: '"화장품 안전 기술 규범" 개정으로 다이옥산(Dioxane) 및 특정 보존제의 배합 한도가 강화되었습니다.',
                     date: '2026-01-18'
                },
                {
                    type: 'info',
                    title: '동물실험 면제 절차 간소화',
                    content: '해외 제조사의 GMP 인증서 인정 범위가 확대되어, 국내 식약처 발행 인증서로도 면제 신청이 용이해졌습니다.',
                    date: '2026-01-18'
                }
            ]
        },
        '일본': {
            flag: '🇯🇵',
            color: '#F59E0B',
            fullName: 'Japan',
            authority: 'MHLW (Ministry of Health, Labour and Welfare)',
            marketSize: '¥2.75T',
            marketGrowth: '+2.7% YoY',
            overview: '일본은 아시아 최대 선진 시장 중 하나로, 후생노동성(MHLW)의 규제를 받습니다. 2026년부터는 PFAS(PFHxS 등) 금지 물질 확대와 같은 환경 안전 규제가 대폭 강화되어 성분 검토의 정확성이 더욱 중요해졌습니다.',
            keyFeatures: [
                '의약부외품 vs 일반화장품 구분',
                '특정 화학물질 금지 목록 확대',
                '전성분 일본어 표기 의무',
                '제조판매업 허가(임포터)'
            ],
            regulations: [
                {
                    id: 1,
                    title: '일본 화심법(CSCL) 개정',
                    category: '필수',
                    priority: 'high',
                    description: '일본 내 제조 또는 수입되는 신규 화학물질의 안전성을 관리하는 법률로, 최근 소량 신규 물질 신고 제도가 전면 개편되었습니다.',
                    timeline: '수출 전 필수',
                    cost: '¥300,000 - ¥500,000/년',
                    requirements: [
                        '제조판매업 허가 보유',
                        '책임기술자 배치',
                        '신규 물질 사전 심사',
                        '품질관리 및 리콜 체계'
                    ],
                    documents: ['제조판매업 허가증 (일본 수입자 보유 분)', '책임기술자 자격 증명 서류', '사업자 등록증 및 고용 계약서'],
                    links: ['https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kenkou_iryou/iyakuhin/index.html']
                },
                {
                    id: 2,
                    title: '의약부외품 광고 지침',
                    category: '필수',
                    priority: 'high',
                    description: '효능을 보장하거나 "노화 방지"와 같이 직접적인 효과를 시사하는 표현은 금지되며, 승인된 범위 내의 표현만 가능합니다.',
                    timeline: '3-4주',
                    cost: '¥100,000 - ¥300,000',
                    requirements: [
                        '네거티브 리스트 확인',
                        '포지티브 리스트 준수',
                        '금지 표현 배제'
                    ],
                    documents: ['전성분 리스트 (일문 번역본)', '원료 규격서 및 안전성 데이터 (MSDS)', '시험성적서 (CoA) 및 분석 증명서'],
                    links: ['https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kenkou_iryou/iyakuhin/keshouhin/index.html']
                },
                {
                    id: 3,
                    title: '안전성 실증 자료 보관',
                    category: '필수',
                    priority: 'high',
                    description: '일본 내 유통되는 모든 화장품은 품질 관리와 사후 안전성 보고를 위한 문서 체계를 갖추어야 합니다.',
                    timeline: '2-4주',
                    cost: '¥50,000 - ¥150,000',
                    requirements: [
                        '제품 표준서 작성',
                        '전성분 목록 관리',
                        '제조방법 개요 및 품질관리'
                    ],
                    documents: ['제품 표준서 (Product Specification)', '제조방법서 및 공정 흐름도', '시험성적서 및 안전성 평가 보고서'],
                    links: ['https://www.pmda.go.jp/review-services/drug-reviews/0001.html']
                },
            ],
            roadmap: [
                { step: 1, title: '수입업자(제조판매업자) 선정', duration: '2주', status: 'start' },
                { step: 2, title: '성분 및 금지 물질 검토', duration: '3주', status: 'process' },
                { step: 3, title: '외국 제조업체 인정 신청', duration: '6-8주', status: 'process' },
                { step: 4, title: '화장품 제조판매 신고', duration: '1주', status: 'process' },
                { step: 5, title: '일본어 라벨 및 패키지 제작', duration: '2주', status: 'process' },
                { step: 6, title: '수출 개시', duration: '-', status: 'complete' }
            ],
            estimatedTime: '3-5개월',
            estimatedCost: '¥800,000 - ¥1,500,000',
            requiredDocuments: [
                '외국 제조업자 인정 서류',
                '전성분 리스트 (일문)',
                '제품 표준서',
                '제조방법서',
                '시험성적서'
            ],
            alerts: [
                {
                    type: 'warning',
                    title: 'PFAS 관련 물질 수입 금지',
                    content: '장관령 발표에 따라 117종의 PFHxS 관련 물질을 함유한 제품의 수입이 원칙적으로 금지됩니다. 성분 분석표 재검토가 시급합니다.',
                    date: '2026-01-20'
                },
                {
                    type: 'alert',
                    title: '향료 알레르기 성분 공시 권고 확대',
                    content: 'EU 규정과 유사하게 특정 알레르기 유발 성분에 대한 상세 표기가 권장되며, 투명한 정보 공개가 중요해졌습니다.',
                    date: '2026-01-12'
                },
                {
                    type: 'info',
                    title: '화장품 전공 학과 신설 및 인재 공급',
                    content: '국립대학(사가대 등)에 화장품 전문 교육 과정이 신설되어, 향후 현지 기업과의 기술 협력 기회가 확대될 전망입니다.',
                    date: '2026-01-12'
                }
            ]
        }
    };

    const countries = [
        { name: '미국', flag: '🇺🇸', color: '#3B82F6' },
        { name: '유럽연합', flag: '🇪🇺', color: '#8B5CF6' },
        { name: '중국', flag: '🇨🇳', color: '#EF4444' },
        { name: '일본', flag: '🇯🇵', color: '#F59E0B' }
    ];

    const selectedCountryData = selectedCountry ? countriesData[selectedCountry] : null;

    // 규제 상세보기 모달
    const RegulationDetailModal = () => {
        if (!selectedRegulation) return null;

        const getPriorityColor = (priority) => {
            switch(priority) {
                case 'high': return { bg: '#FEF2F2', border: '#FECACA', text: '#991B1B', label: '높음' };
                case 'medium': return { bg: '#FFFBEB', border: '#FEF3C7', text: '#92400E', label: '중간' };
                case 'low': return { bg: '#F0FDF4', border: '#BBF7D0', text: '#166534', label: '낮음' };
                default: return { bg: '#F8FAFC', border: '#E2E8F0', text: '#475569', label: '일반' };
            }
        };

        const priorityStyle = getPriorityColor(selectedRegulation.priority);

        return (
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '20px'
            }}
                 onClick={() => setSelectedRegulation(null)}
            >
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '24px',
                    padding: '40px',
                    maxWidth: '700px',
                    width: '100%',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
                }}
                     onClick={(e) => e.stopPropagation()}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '24px' }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                                <span style={{
                                    padding: '6px 14px',
                                    backgroundColor: selectedCountryData.color + '20',
                                    borderRadius: '8px',
                                    fontSize: '13px',
                                    fontWeight: '700',
                                    color: selectedCountryData.color
                                }}>
                                    {selectedCountry}
                                </span>
                                <span style={{
                                    padding: '6px 14px',
                                    backgroundColor: selectedRegulation.category === '필수' ? '#FEF2F2' : '#F0FDF4',
                                    borderRadius: '8px',
                                    fontSize: '13px',
                                    fontWeight: '700',
                                    color: selectedRegulation.category === '필수' ? '#991B1B' : '#166534'
                                }}>
                                    {selectedRegulation.category}
                                </span>
                                <span style={{
                                    padding: '6px 14px',
                                    backgroundColor: priorityStyle.bg,
                                    borderRadius: '8px',
                                    fontSize: '13px',
                                    fontWeight: '700',
                                    color: priorityStyle.text
                                }}>
                                    우선순위: {priorityStyle.label}
                                </span>
                            </div>
                            <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>
                                {selectedRegulation.title}
                            </h2>
                            <p style={{ fontSize: '15px', color: '#64748b', lineHeight: '1.6' }}>
                                {selectedRegulation.description}
                            </p>
                        </div>
                        <button
                            onClick={() => setSelectedRegulation(null)}
                            style={{
                                padding: '8px',
                                backgroundColor: '#f1f5f9',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginLeft: '16px'
                            }}
                        >
                            <X size={20} color="#64748b" />
                        </button>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b', marginBottom: '16px' }}>
                            주요 요구사항
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {selectedRegulation.requirements.map((req, idx) => (
                                <div key={idx} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    padding: '12px 16px',
                                    backgroundColor: '#F8FAFC',
                                    borderRadius: '12px',
                                    border: '1px solid #E2E8F0'
                                }}>
                                    <CheckCircle size={18} color="#10B981" />
                                    <span style={{ fontSize: '14px', color: '#334155' }}>{req}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b', marginBottom: '16px' }}>
                            필요 서류
                        </h3>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {selectedRegulation.documents.map((doc, idx) => (
                                <span key={idx} style={{
                                    padding: '8px 16px',
                                    backgroundColor: '#F0F9FF',
                                    border: '1px solid #BAE6FD',
                                    borderRadius: '20px',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    color: '#0369A1'
                                }}>
                                    {doc}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div style={{
                        padding: '20px',
                        backgroundColor: '#F0F9FF',
                        borderRadius: '16px',
                        border: '1px solid #BAE6FD'
                    }}>
                        <h3 style={{
                            fontSize: '16px',
                            fontWeight: '700',
                            color: '#1e293b',
                            marginBottom: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            <ExternalLink size={18} color="#0284C7" />
                            관련 링크
                        </h3>
                        {selectedRegulation.links.map((link, idx) => (
                            <a
                                key={idx}
                                href={link}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    display: 'block',
                                    fontSize: '14px',
                                    color: '#0284C7',
                                    textDecoration: 'none',
                                    marginBottom: '6px',
                                    fontWeight: '500',
                                    wordBreak: 'break-all'
                                }}
                            >
                                {link}
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    // 메인 화면 (국가 선택 전)
    if (!selectedCountry) {
        return (
            <div style={{
                width: '100%',
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: '#F8FAFC',
                padding: '40px 40px 80px',
                overflowY: 'auto',
                boxSizing: 'border-box'
            }}>
                <style>{`
                    @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css');
                    .country-regulations-container * {
                        font-family: 'Pretendard Variable', Pretendard, sans-serif;
                        letter-spacing: -0.02em;
                    }
                    .country-regulations-container .serif-font {
                        font-family: 'Pretendard Variable', Pretendard, sans-serif;
                        font-weight: 700;
                        letter-spacing: -0.03em;
                    }
                `}</style>

                {/* Header */}
                <div style={{ marginBottom: '48px', textAlign: 'center' }}>
                    <h1 className="serif-font" style={{
                        fontSize: '48px',
                        fontWeight: '700',
                        color: '#1E293B',
                        marginBottom: '16px',
                        margin: 0
                    }}>
                        국가별 화장품 수출 규제 정보
                    </h1>
                    <p style={{ fontSize: '18px', color: '#64748B', maxWidth: '600px', margin: '16px auto 0' }}>
                        수출하려는 국가를 선택하여 필요한 규제, 절차, 서류를 확인하세요
                    </p>
                </div>

                {/* Country Cards */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '24px',
                    maxWidth: '1200px',
                    margin: '0 auto',
                    width: '100%'
                }}>
                    {countries.map(country => {
                        const data = countriesData[country.name];
                        return (
                            <div
                                key={country.name}
                                onClick={() => setSelectedCountry(country.name)}
                                style={{
                                    backgroundColor: 'white',
                                    borderRadius: '24px',
                                    padding: '32px',
                                    cursor: 'pointer',
                                    border: '2px solid transparent',
                                    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                                    transition: 'all 0.3s ease',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-8px)';
                                    e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.12)';
                                    e.currentTarget.style.borderColor = country.color;
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)';
                                    e.currentTarget.style.borderColor = 'transparent';
                                }}
                            >
                                <div style={{
                                    position: 'absolute',
                                    top: '-20px',
                                    right: '-20px',
                                    fontSize: '120px',
                                    opacity: '0.1'
                                }}>
                                    {country.flag}
                                </div>

                                <div style={{ position: 'relative', zIndex: 1 }}>
                                    <div style={{ fontSize: '64px', marginBottom: '16px' }}>
                                        {country.flag}
                                    </div>
                                    <h2 style={{
                                        fontSize: '28px',
                                        fontWeight: '700',
                                        color: '#1E293B',
                                        marginBottom: '8px'
                                    }}>
                                        {country.name}
                                    </h2>
                                    <p style={{
                                        fontSize: '14px',
                                        color: '#64748B',
                                        marginBottom: '20px'
                                    }}>
                                        {data.fullName}
                                    </p>

                                    <div style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '12px',
                                        marginBottom: '24px'
                                    }}>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}>
                                            <Building2 size={18} color={country.color} />
                                            <span style={{ fontSize: '13px', color: '#475569' }}>
                                                {data.authority}
                                            </span>
                                        </div>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}>
                                            <TrendingUp size={18} color={country.color} />
                                            <span style={{ fontSize: '13px', color: '#475569' }}>
                                                시장 규모: {data.marketSize}
                                            </span>
                                        </div>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}>
                                            <Globe size={18} color={country.color} />
                                            <span style={{ fontSize: '13px', color: '#475569' }}>
                                                성장률: {data.marketGrowth}
                                            </span>
                                        </div>
                                    </div>

                                    <button style={{
                                        width: '100%',
                                        padding: '14px',
                                        backgroundColor: country.color,
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '12px',
                                        fontSize: '15px',
                                        fontWeight: '700',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px'
                                    }}>
                                        규제 정보 보기
                                        <ChevronRight size={18} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Info Banner */}
                <div style={{
                    marginTop: '48px',
                    padding: '24px',
                    backgroundColor: '#FFFBEB',
                    borderRadius: '16px',
                    border: '1px solid #FEF3C7',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    maxWidth: '1200px',
                    margin: '48px auto 0'
                }}>
                    <AlertTriangle size={24} color="#F59E0B" />
                    <div>
                        <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#92400E', marginBottom: '4px' }}>
                            규제 정보 업데이트
                        </h3>
                        <p style={{ fontSize: '14px', color: '#92400E', margin: 0 }}>
                            각 국가의 화장품 규제는 수시로 변경될 수 있습니다. 최신 정보는 해당 국가의 공식 웹사이트에서 확인하세요.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // 국가 상세 화면
    return (
        <div style={{
            width: '100%',
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#F8FAFC',
            padding: '40px 40px 80px',
            overflowY: 'auto',
            boxSizing: 'border-box'
        }}>
            <style>{`
                @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css');
                .country-regulations-container * {
                    font-family: 'Pretendard Variable', Pretendard, sans-serif;
                    letter-spacing: -0.02em;
                }
                .country-regulations-container .serif-font {
                    font-family: 'Pretendard Variable', Pretendard, sans-serif;
                    font-weight: 700;
                    letter-spacing: -0.03em;
                }
            `}</style>

            {selectedRegulation && <RegulationDetailModal />}

            {/* Back Button */}
            <button
                onClick={() => setSelectedCountry(null)}
                style={{
                    marginBottom: '32px',
                    padding: '12px 24px',
                    backgroundColor: 'white',
                    border: '1px solid #E2E8F0',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: selectedCountryData.color,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    alignSelf: 'flex-start',
                    transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = selectedCountryData.color + '10';
                    e.currentTarget.style.transform = 'translateX(-4px)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'white';
                    e.currentTarget.style.transform = 'translateX(0)';
                }}
            >
                ← 국가 선택으로 돌아가기
            </button>

            {/* Country Header */}
            <div style={{
                backgroundColor: 'white',
                borderRadius: '24px',
                padding: '40px',
                marginBottom: '32px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                border: `2px solid ${selectedCountryData.color}20`
            }}>
                <div style={{ display: 'flex', alignItems: 'start', gap: '24px', marginBottom: '24px' }}>
                    <div style={{ fontSize: '80px' }}>
                        {selectedCountryData.flag}
                    </div>
                    <div style={{ flex: 1 }}>
                        <h1 className="serif-font" style={{
                            fontSize: '36px',
                            fontWeight: '700',
                            color: '#1E293B',
                            marginBottom: '8px'
                        }}>
                            {selectedCountry}
                        </h1>
                        <p style={{ fontSize: '16px', color: '#64748B', marginBottom: '16px' }}>
                            {selectedCountryData.fullName}
                        </p>
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px 16px',
                            backgroundColor: selectedCountryData.color + '20',
                            borderRadius: '20px'
                        }}>
                            <Building2 size={18} color={selectedCountryData.color} />
                            <span style={{
                                fontSize: '14px',
                                fontWeight: '600',
                                color: selectedCountryData.color
                            }}>
                                {selectedCountryData.authority}
                            </span>
                        </div>
                    </div>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '20px',
                    marginBottom: '24px'
                }}>
                    <div style={{
                        padding: '20px',
                        backgroundColor: '#F8FAFC',
                        borderRadius: '16px',
                        border: '1px solid #E2E8F0'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <Globe size={20} color={selectedCountryData.color} />
                            <span style={{ fontSize: '13px', fontWeight: '600', color: '#64748B' }}>
                                시장 규모
                            </span>
                        </div>
                        <p style={{ fontSize: '22px', fontWeight: '700', color: '#1E293B', margin: 0 }}>
                            {selectedCountryData.marketSize}
                        </p>
                    </div>
                    <div style={{
                        padding: '20px',
                        backgroundColor: '#F8FAFC',
                        borderRadius: '16px',
                        border: '1px solid #E2E8F0'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <TrendingUp size={20} color={selectedCountryData.color} />
                            <span style={{ fontSize: '13px', fontWeight: '600', color: '#64748B' }}>
                                성장률
                            </span>
                        </div>
                        <p style={{ fontSize: '22px', fontWeight: '700', color: '#1E293B', margin: 0 }}>
                            {selectedCountryData.marketGrowth}
                        </p>
                    </div>
                    <div style={{
                        padding: '20px',
                        backgroundColor: '#F8FAFC',
                        borderRadius: '16px',
                        border: '1px solid #E2E8F0'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <Clock size={20} color={selectedCountryData.color} />
                            <span style={{ fontSize: '13px', fontWeight: '600', color: '#64748B' }}>
                                예상 소요 시간
                            </span>
                        </div>
                        <p style={{ fontSize: '22px', fontWeight: '700', color: '#1E293B', margin: 0 }}>
                            {selectedCountryData.estimatedTime}
                        </p>
                    </div>
                </div>

                <div style={{
                    padding: '20px',
                    backgroundColor: selectedCountryData.color + '10',
                    borderRadius: '16px',
                    border: `1px solid ${selectedCountryData.color}30`
                }}>
                    <h3 style={{
                        fontSize: '16px',
                        fontWeight: '700',
                        color: '#1E293B',
                        marginBottom: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <Info size={18} color={selectedCountryData.color} />
                        시장 개요
                    </h3>
                    <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.7', margin: 0 }}>
                        {selectedCountryData.overview}
                    </p>
                </div>
            </div>

            {/* Key Features */}
            <div style={{
                backgroundColor: 'white',
                borderRadius: '24px',
                padding: '32px',
                marginBottom: '32px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.08)'
            }}>
                <h2 style={{
                    fontSize: '24px',
                    fontWeight: '700',
                    color: '#1E293B',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                }}>
                    <Shield size={24} color={selectedCountryData.color} />
                    주요 특징
                </h2>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '16px'
                }}>
                    {selectedCountryData.keyFeatures.map((feature, idx) => (
                        <div key={idx} style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '16px',
                            backgroundColor: '#F8FAFC',
                            borderRadius: '12px',
                            border: '1px solid #E2E8F0'
                        }}>
                            <CheckCircle size={20} color={selectedCountryData.color} />
                            <span style={{ fontSize: '14px', color: '#334155', fontWeight: '500' }}>
                                {feature}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Roadmap */}
            <div style={{
                backgroundColor: 'white',
                borderRadius: '24px',
                padding: '32px',
                marginBottom: '32px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.08)'
            }}>
                <h2 style={{
                    fontSize: '24px',
                    fontWeight: '700',
                    color: '#1E293B',
                    marginBottom: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                }}>
                    <MapPin size={24} color={selectedCountryData.color} />
                    수출 준비 프로세스
                </h2>

                <div style={{ position: 'relative', paddingLeft: '40px' }}>
                    {/* Timeline Line */}
                    <div style={{
                        position: 'absolute',
                        left: '19px',
                        top: '24px',
                        bottom: '24px',
                        width: '2px',
                        backgroundColor: '#E2E8F0'
                    }} />

                    {selectedCountryData.roadmap.map((step, idx) => {
                        const getStatusColor = () => {
                            switch(step.status) {
                                case 'start': return { bg: '#DBEAFE', color: '#1E40AF' };
                                case 'process': return { bg: selectedCountryData.color + '20', color: selectedCountryData.color };
                                case 'optional': return { bg: '#FEF3C7', color: '#92400E' };
                                case 'verify': return { bg: '#E0E7FF', color: '#4338CA' };
                                case 'complete': return { bg: '#D1FAE5', color: '#065F46' };
                                default: return { bg: '#F1F5F9', color: '#64748B' };
                            }
                        };

                        const statusColor = getStatusColor();

                        return (
                            <div key={idx} style={{
                                position: 'relative',
                                marginBottom: idx < selectedCountryData.roadmap.length - 1 ? '32px' : 0
                            }}>
                                {/* Step Dot */}
                                <div style={{
                                    position: 'absolute',
                                    left: '-29px',
                                    top: '8px',
                                    width: '20px',
                                    height: '20px',
                                    borderRadius: '50%',
                                    backgroundColor: statusColor.bg,
                                    border: `3px solid ${statusColor.color}`,
                                    zIndex: 1
                                }} />

                                <div style={{
                                    padding: '16px 20px',
                                    backgroundColor: '#F8FAFC',
                                    borderRadius: '12px',
                                    border: '1px solid #E2E8F0'
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginBottom: '8px'
                                    }}>
                                        <h3 style={{
                                            fontSize: '16px',
                                            fontWeight: '700',
                                            color: '#1E293B',
                                            margin: 0
                                        }}>
                                            Step {step.step}: {step.title}
                                        </h3>
                                        <span style={{
                                            padding: '4px 12px',
                                            backgroundColor: statusColor.bg,
                                            color: statusColor.color,
                                            borderRadius: '12px',
                                            fontSize: '12px',
                                            fontWeight: '600'
                                        }}>
                                            {step.duration}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Regulations */}
            <div style={{
                backgroundColor: 'white',
                borderRadius: '24px',
                padding: '32px',
                marginBottom: '32px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.08)'
            }}>
                <h2 style={{
                    fontSize: '24px',
                    fontWeight: '700',
                    color: '#1E293B',
                    marginBottom: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                }}>
                    <ClipboardList size={24} color={selectedCountryData.color} />
                    주요 규제 항목
                </h2>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                    gap: '20px'
                }}>
                    {selectedCountryData.regulations.map(regulation => {
                        const getPriorityStyle = () => {
                            switch(regulation.priority) {
                                case 'high': return { bg: '#FEF2F2', border: '#FECACA', text: '#991B1B' };
                                case 'medium': return { bg: '#FFFBEB', border: '#FEF3C7', text: '#92400E' };
                                case 'low': return { bg: '#F0FDF4', border: '#BBF7D0', text: '#166534' };
                                default: return { bg: '#F8FAFC', border: '#E2E8F0', text: '#475569' };
                            }
                        };

                        const priorityStyle = getPriorityStyle();

                        return (
                            <div
                                key={regulation.id}
                                style={{
                                    backgroundColor: 'white',
                                    border: '1px solid #E2E8F0',
                                    borderRadius: '16px',
                                    padding: '24px',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease'
                                }}
                                onClick={() => setSelectedRegulation(regulation)}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-4px)';
                                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
                                    e.currentTarget.style.borderColor = selectedCountryData.color;
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                    e.currentTarget.style.borderColor = '#E2E8F0';
                                }}
                            >
                                <div style={{
                                    display: 'flex',
                                    gap: '8px',
                                    marginBottom: '16px',
                                    flexWrap: 'wrap'
                                }}>
                                    <span style={{
                                        padding: '4px 12px',
                                        backgroundColor: regulation.category === '필수' ? '#FEF2F2' : '#F0FDF4',
                                        border: `1px solid ${regulation.category === '필수' ? '#FECACA' : '#BBF7D0'}`,
                                        borderRadius: '12px',
                                        fontSize: '11px',
                                        fontWeight: '700',
                                        color: regulation.category === '필수' ? '#991B1B' : '#166534'
                                    }}>
                                        {regulation.category}
                                    </span>
                                    <span style={{
                                        padding: '4px 12px',
                                        backgroundColor: priorityStyle.bg,
                                        border: `1px solid ${priorityStyle.border}`,
                                        borderRadius: '12px',
                                        fontSize: '11px',
                                        fontWeight: '700',
                                        color: priorityStyle.text
                                    }}>
                                        {regulation.priority === 'high' ? '높음' : regulation.priority === 'medium' ? '중간' : '낮음'}
                                    </span>
                                </div>

                                <h3 style={{
                                    fontSize: '18px',
                                    fontWeight: '700',
                                    color: '#1E293B',
                                    marginBottom: '12px'
                                }}>
                                    {regulation.title}
                                </h3>

                                <p style={{
                                    fontSize: '14px',
                                    color: '#64748B',
                                    lineHeight: '1.6',
                                    marginBottom: '16px'
                                }}>
                                    {regulation.description}
                                </p>

                                <button style={{
                                    width: '100%',
                                    padding: '12px',
                                    backgroundColor: selectedCountryData.color + '10',
                                    border: 'none',
                                    borderRadius: '12px',
                                    fontSize: '14px',
                                    fontWeight: '700',
                                    color: selectedCountryData.color,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px'
                                }}>
                                    상세 정보 보기
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Required Documents */}
            <div style={{
                backgroundColor: 'white',
                borderRadius: '24px',
                padding: '32px',
                marginBottom: '32px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.08)'
            }}>
                <h2 style={{
                    fontSize: '24px',
                    fontWeight: '700',
                    color: '#1E293B',
                    marginBottom: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                }}>
                    <FileText size={24} color={selectedCountryData.color} />
                    필수 제출 서류
                </h2>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                    gap: '12px'
                }}>
                    {selectedCountryData.requiredDocuments.map((doc, idx) => (
                        <div key={idx} style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '16px',
                            backgroundColor: '#F8FAFC',
                            borderRadius: '12px',
                            border: '1px solid #E2E8F0'
                        }}>
                            <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '8px',
                                backgroundColor: selectedCountryData.color + '20',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                            }}>
                                <FileText size={18} color={selectedCountryData.color} />
                            </div>
                            <span style={{
                                fontSize: '14px',
                                fontWeight: '600',
                                color: '#334155'
                            }}>
                                {doc}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Alerts */}
            {selectedCountryData.alerts && selectedCountryData.alerts.length > 0 && (
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '24px',
                    padding: '32px',
                    marginBottom: '32px',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.08)'
                }}>
                    <h2 style={{
                        fontSize: '24px',
                        fontWeight: '700',
                        color: '#1E293B',
                        marginBottom: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                    }}>
                        <Bell size={24} color={selectedCountryData.color} />
                        최신 규제 업데이트
                    </h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {selectedCountryData.alerts.map((alert, idx) => {
                            const getAlertStyle = () => {
                                switch(alert.type) {
                                    case 'alert': return { bg: '#FEF2F2', border: '#FECACA', icon: '#DC2626' };
                                    case 'warning': return { bg: '#FFFBEB', border: '#FEF3C7', icon: '#F59E0B' };
                                    case 'info': return { bg: '#EFF6FF', border: '#BFDBFE', icon: '#3B82F6' };
                                    default: return { bg: '#F8FAFC', border: '#E2E8F0', icon: '#64748B' };
                                }
                            };

                            const alertStyle = getAlertStyle();

                            return (
                                <div key={idx} style={{
                                    padding: '20px',
                                    backgroundColor: alertStyle.bg,
                                    borderRadius: '16px',
                                    border: `1px solid ${alertStyle.border}`
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'start',
                                        gap: '12px',
                                        marginBottom: '8px'
                                    }}>
                                        <AlertTriangle size={20} color={alertStyle.icon} style={{ flexShrink: 0, marginTop: '2px' }} />
                                        <div style={{ flex: 1 }}>
                                            <h3 style={{
                                                fontSize: '16px',
                                                fontWeight: '700',
                                                color: alertStyle.icon,
                                                marginBottom: '8px'
                                            }}>
                                                {alert.title}
                                            </h3>
                                            <p style={{
                                                fontSize: '14px',
                                                color: alertStyle.icon,
                                                lineHeight: '1.6',
                                                marginBottom: '8px'
                                            }}>
                                                {alert.content}
                                            </p>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                fontSize: '12px',
                                                color: '#64748B'
                                            }}>
                                                <Clock size={12} />
                                                {alert.date}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
