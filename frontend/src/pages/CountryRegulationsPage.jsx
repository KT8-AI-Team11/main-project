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
            marketSize: '$90.6B',
            marketGrowth: '+4.2% YoY',
            overview: '미국은 세계 최대의 화장품 시장으로, FDA의 규제를 받습니다. 2022년 MoCRA 법안 통과로 규제가 강화되었으며, 시설 등록과 제품 목록 제출이 의무화되었습니다.',
            keyFeatures: [
                '자발적 등록에서 의무 등록으로 전환',
                '중대한 부작용 보고 의무화',
                '특정 성분 라벨 표기 강화',
                'GMP 가이드라인 준수 권장'
            ],
            regulations: [
                {
                    id: 1,
                    title: 'MoCRA 시설 등록',
                    category: '필수',
                    priority: 'high',
                    description: '2022년 제정된 MoCRA에 따라 모든 화장품 제조시설은 FDA에 등록해야 합니다.',
                    timeline: '즉시',
                    cost: '무료',
                    requirements: [
                        'FDA 온라인 시스템 계정 생성',
                        '시설 정보 등록 (주소, 연락처 등)',
                        '제조 활동 유형 선택',
                        '연간 갱신 필수'
                    ],
                    documents: ['시설 정보', '제조업 허가증', '책임자 정보'],
                    links: ['https://www.fda.gov/cosmetics/cosmetics-laws-regulations/modernization-cosmetics-regulation-act-2022-mocra']
                },
                {
                    id: 2,
                    title: 'FDA 제품 목록 제출',
                    category: '필수',
                    priority: 'high',
                    description: '제조하거나 수입하는 모든 화장품 제품을 FDA에 신고해야 합니다.',
                    timeline: '제품 출시 전',
                    cost: '무료',
                    requirements: [
                        '제품명 및 브랜드 정보',
                        '전성분 목록 (INCI 명칭)',
                        '제품 카테고리 분류',
                        '제조사 및 판매자 정보'
                    ],
                    documents: ['제품 포뮬라', '전성분 리스트', '제품 라벨'],
                    links: ['https://www.fda.gov/cosmetics']
                },
                {
                    id: 3,
                    title: 'FTC 광고 규제 준수',
                    category: '권장',
                    priority: 'medium',
                    description: '연방거래위원회(FTC)는 화장품 광고가 진실되고 입증 가능해야 한다고 규정합니다.',
                    timeline: '지속적',
                    cost: '$2,000 - $10,000 (법률 자문)',
                    requirements: [
                        '과학적 근거가 있는 효능 주장',
                        '오해의 소지가 없는 표현',
                        '전후 사진의 정확한 표현',
                        '추천사의 진정성 보장'
                    ],
                    documents: ['효능 입증 자료', '임상 시험 결과', '광고 검토 의견서'],
                    links: ['https://www.ftc.gov']
                },
                {
                    id: 4,
                    title: 'VCRP 자발적 등록',
                    category: '권장',
                    priority: 'low',
                    description: 'Voluntary Cosmetic Registration Program - 제품의 신뢰도를 높이는 자발적 프로그램입니다.',
                    timeline: '2-4주',
                    cost: '무료',
                    requirements: [
                        '제조시설 등록',
                        '제품 성분 정보 제출',
                        '원료 안전성 데이터',
                        'GMP 준수 여부'
                    ],
                    documents: ['GMP 인증서', '안전성 평가서', '품질 관리 문서'],
                    links: ['https://www.fda.gov/cosmetics/voluntary-cosmetic-registration-program']
                }
            ],
            roadmap: [
                { step: 1, title: 'FDA 시설 등록', duration: '1주', status: 'start' },
                { step: 2, title: '제품 목록 작성', duration: '2주', status: 'process' },
                { step: 3, title: '라벨 검토 및 승인', duration: '2주', status: 'process' },
                { step: 4, title: 'VCRP 등록 (선택)', duration: '2주', status: 'optional' },
                { step: 5, title: '최종 검증', duration: '1주', status: 'verify' },
                { step: 6, title: '수출 개시', duration: '-', status: 'complete' }
            ],
            estimatedTime: '6-8주',
            estimatedCost: '$3,000 - $8,000',
            requiredDocuments: [
                '제품 포뮬라 정보',
                '라벨 샘플 (영문)',
                '제조시설 정보',
                'GMP 준수 증명',
                '안전성 평가서',
                'SPF 테스트 결과 (해당시)'
            ],
            alerts: [
                {
                    type: 'warning',
                    title: 'MoCRA 완전 시행 임박',
                    content: '2026년 말까지 모든 기존 제품도 등록을 완료해야 합니다.',
                    date: '2026-01-15'
                },
                {
                    type: 'info',
                    title: 'SPF 테스트 기준 변경',
                    content: '새로운 SPF 테스트 프로토콜이 2026년 6월부터 적용됩니다.',
                    date: '2026-01-20'
                }
            ]
        },
        '유럽연합': {
            flag: '🇪🇺',
            color: '#8B5CF6',
            fullName: 'European Union',
            authority: 'European Commission',
            marketSize: '€78.6B',
            marketGrowth: '+3.8% YoY',
            overview: 'EU는 세계에서 가장 엄격한 화장품 규제를 시행하고 있습니다. Regulation (EC) No 1223/2009에 따라 1,300개 이상의 성분이 금지되며, CPSR(안전성 평가 보고서)가 필수입니다.',
            keyFeatures: [
                '세계에서 가장 엄격한 성분 규제',
                'EU 내 책임자(RP) 지정 필수',
                'CPNP 포털 등록 의무',
                'PIF(제품 정보 파일) 10년간 보관'
            ],
            regulations: [
                {
                    id: 1,
                    title: 'EU 책임자(RP) 지정',
                    category: '필수',
                    priority: 'high',
                    description: 'EU 내에서 제품에 대한 책임을 지는 법인 또는 개인을 지정해야 합니다.',
                    timeline: '수출 전 필수',
                    cost: '€2,000 - €5,000/년',
                    requirements: [
                        'EU 소재 법인 또는 개인',
                        '화장품 안전성 평가 능력',
                        'PIF 관리 책임',
                        '제품 리콜 권한'
                    ],
                    documents: ['RP 계약서', '사업자 등록증', '책임보험 증명'],
                    links: ['https://ec.europa.eu/growth/sectors/cosmetics']
                },
                {
                    id: 2,
                    title: 'CPSR 안전성 평가 보고서',
                    category: '필수',
                    priority: 'high',
                    description: 'Cosmetic Product Safety Report는 EU 진출을 위한 필수 문서로, 전문가가 작성해야 합니다.',
                    timeline: '4-8주',
                    cost: '€1,500 - €5,000',
                    requirements: [
                        '제품 설명 및 의도된 용도',
                        '안전성 평가 결론',
                        '라벨 표시 및 경고문',
                        '독성학자 또는 의사의 서명'
                    ],
                    documents: ['제품 포뮬라', '원료 MSDS', '안정성 시험 자료', 'CoA'],
                    links: ['https://ec.europa.eu/growth/sectors/cosmetics/cpsr']
                },
                {
                    id: 3,
                    title: 'PIF 제품 정보 파일 작성',
                    category: '필수',
                    priority: 'high',
                    description: 'Product Information File - 제품에 대한 모든 정보를 담은 문서로 10년간 보관해야 합니다.',
                    timeline: '3-6주',
                    cost: '€500 - €2,000',
                    requirements: [
                        '제품 설명 및 안전성 평가',
                        '제조 방법 및 GMP 적합성',
                        '효능 입증 자료',
                        '동물실험 데이터 (있는 경우)'
                    ],
                    documents: ['CPSR', 'GMP 인증서', '효능 입증 자료', '공정 흐름도'],
                    links: ['https://ec.europa.eu/growth/sectors/cosmetics/pif']
                },
                {
                    id: 4,
                    title: 'CPNP 포털 등록',
                    category: '필수',
                    priority: 'high',
                    description: 'Cosmetic Products Notification Portal - EU 시장에 출시되는 모든 화장품을 등록하는 시스템입니다.',
                    timeline: '제품 출시 전',
                    cost: '무료',
                    requirements: [
                        'RP 정보',
                        '제품 카테고리 및 명칭',
                        '전성분 목록',
                        '라벨 이미지 업로드'
                    ],
                    documents: ['제품 포뮬라', '라벨 파일', 'CPSR 요약'],
                    links: ['https://ec.europa.eu/growth/sectors/cosmetics/cpnp']
                },
                {
                    id: 5,
                    title: 'Annex II 금지 성분 검토',
                    category: '필수',
                    priority: 'high',
                    description: 'EU에서 금지된 1,300개 이상의 성분과 제품 포뮬라를 대조 분석합니다.',
                    timeline: '3-6주',
                    cost: '€500 - €2,000',
                    requirements: [
                        'Annex II 금지 성분 확인',
                        'Annex III 제한 성분 확인',
                        'CMR 물질 검토',
                        '나노물질 사용 여부'
                    ],
                    documents: ['전성분 리스트', '원료 CoA', 'MSDS'],
                    links: ['https://ec.europa.eu/growth/sectors/cosmetics/legislation']
                }
            ],
            roadmap: [
                { step: 1, title: 'RP 지정', duration: '1주', status: 'start' },
                { step: 2, title: '성분 검토 (Annex II)', duration: '3주', status: 'process' },
                { step: 3, title: 'PIF 작성', duration: '4주', status: 'process' },
                { step: 4, title: 'CPSR 평가', duration: '4주', status: 'process' },
                { step: 5, title: 'CPNP 등록', duration: '1주', status: 'process' },
                { step: 6, title: '라벨 검토', duration: '2주', status: 'verify' },
                { step: 7, title: '수출 개시', duration: '-', status: 'complete' }
            ],
            estimatedTime: '12-16주',
            estimatedCost: '€8,000 - €15,000',
            requiredDocuments: [
                'CPSR (안전성 평가 보고서)',
                '성분 분석표 (CoA)',
                'GMP 인증서',
                'MSDS 데이터',
                'PIF (제품 정보 파일)',
                '안정성 테스트 결과',
                '공정 흐름도',
                '효능 입증 자료'
            ],
            alerts: [
                {
                    type: 'alert',
                    title: '특정 보존제 사용 금지 예고',
                    content: '2026년 6월부터 프로필/부틸 파라벤의 사용이 추가 제한됩니다.',
                    date: '2026-01-28'
                },
                {
                    type: 'warning',
                    title: 'Microplastics 규제 시행',
                    content: '2026년부터 특정 마이크로플라스틱 성분의 사용이 단계적으로 금지됩니다.',
                    date: '2026-01-22'
                }
            ]
        },
        '중국': {
            flag: '🇨🇳',
            color: '#EF4444',
            fullName: 'People\'s Republic of China',
            authority: 'NMPA (National Medical Products Administration)',
            marketSize: '$77.1B',
            marketGrowth: '+8.6% YoY',
            overview: '중국은 빠르게 성장하는 화장품 시장으로, NMPA의 엄격한 규제를 받습니다. 2021년부터 일반 화장품은 신고제로 전환되었으나, 여전히 복잡한 절차와 중국어 서류가 필요합니다.',
            keyFeatures: [
                '일반 화장품 신고제 전환',
                '동물실험 일부 면제 가능',
                '중국어 라벨 필수',
                '중국 내 책임자 지정 필요'
            ],
            regulations: [
                {
                    id: 1,
                    title: '수입업자 및 책임자 지정',
                    category: '필수',
                    priority: 'high',
                    description: '중국 내 공식 수입 대행사 및 제품에 대한 책임을 지는 중국 법인을 지정해야 합니다.',
                    timeline: '수출 전 필수',
                    cost: 'RMB 30,000 - 50,000/년',
                    requirements: [
                        '중국 내 수입업 허가를 보유한 법인',
                        '화장품 수입 경험',
                        '창고 및 품질관리 시설',
                        '제품 리콜 능력'
                    ],
                    documents: ['수입업 허가증', '사업자 등록증', '창고 계약서'],
                    links: ['http://www.nmpa.gov.cn']
                },
                {
                    id: 2,
                    title: 'NMPA 성분 검토',
                    category: '필수',
                    priority: 'high',
                    description: 'NMPA 승인 성분 리스트와 제품 포뮬라를 대조하고, 필요시 포뮬라를 조정합니다.',
                    timeline: '4-6주',
                    cost: 'RMB 10,000 - 20,000',
                    requirements: [
                        'NMPA 승인 성분 목록 확인',
                        '사용 제한 성분 검토',
                        '금지 성분 확인',
                        '신원료 등록 필요 여부'
                    ],
                    documents: ['전성분 리스트 (중문)', '원료 MSDS', 'CoA'],
                    links: ['http://www.nmpa.gov.cn/directory/web/nmpa/xxgk/fgwj/gzwj/gzwjhzp']
                },
                {
                    id: 3,
                    title: '비특수 화장품 신고',
                    category: '필수',
                    priority: 'high',
                    description: '2021년부터 일반(비특수) 화장품은 온라인 신고제로 전환되었습니다.',
                    timeline: '3-6개월',
                    cost: 'RMB 50,000 - 100,000',
                    requirements: [
                        '제품 안전 평가 자료',
                        '생산국 생산판매 증명',
                        '온라인 신고 시스템 제출',
                        '중국 내 책임자 지정'
                    ],
                    documents: ['안전성 평가 자료', 'ISO 22716', '생산판매 증명', '포뮬라 정보'],
                    links: ['http://www.nmpa.gov.cn/hzhp']
                },
                {
                    id: 4,
                    title: '동물실험 면제 신청',
                    category: '권장',
                    priority: 'medium',
                    description: '특정 조건을 만족하면 동물실험을 면제받을 수 있습니다.',
                    timeline: '2-4주',
                    cost: 'RMB 20,000 - 40,000',
                    requirements: [
                        'GMP 인증서 (ISO 22716)',
                        '원료 안전성 자료',
                        '생산국 생산판매 증명',
                        '제품 안전성 평가 보고서'
                    ],
                    documents: ['ISO 22716', '안전성 평가서', 'MSDS', '생산판매 증명'],
                    links: ['http://www.nmpa.gov.cn']
                },
                {
                    id: 5,
                    title: '중국어 라벨 제작',
                    category: '필수',
                    priority: 'high',
                    description: 'NMPA 규정에 맞는 중국어 라벨을 제작하고 승인받아야 합니다.',
                    timeline: '4-8주',
                    cost: 'RMB 5,000 - 15,000',
                    requirements: [
                        '제품명 (중문 + 원어)',
                        '전성분 표시 (INCI + 중문)',
                        '제조일자 및 유통기한',
                        '사용 방법 및 주의사항',
                        '허가 받은 효능만 표기'
                    ],
                    documents: ['라벨 디자인', '전성분 번역본', '효능 표현 검토서'],
                    links: ['http://www.nmpa.gov.cn']
                }
            ],
            roadmap: [
                { step: 1, title: '수입사 선정', duration: '2주', status: 'start' },
                { step: 2, title: '성분 검토', duration: '4주', status: 'process' },
                { step: 3, title: '동물실험 면제 신청', duration: '4주', status: 'optional' },
                { step: 4, title: '제품 신고', duration: '12주', status: 'process' },
                { step: 5, title: '라벨 승인', duration: '6주', status: 'process' },
                { step: 6, title: '통관 준비', duration: '2주', status: 'verify' },
                { step: 7, title: '수출 개시', duration: '-', status: 'complete' }
            ],
            estimatedTime: '6-9개월',
            estimatedCost: 'RMB 80,000 - 150,000',
            requiredDocuments: [
                '제품 포뮬라 및 생산공정',
                'ISO 22716 인증서',
                '포장 및 라벨 정보',
                '생산국 생산판매 증명',
                '제품 안전성 평가 자료',
                '제품 효능 입증 자료',
                '중국 내 책임자 지정 서류'
            ],
            alerts: [
                {
                    type: 'alert',
                    title: '특정 방부제 사용 금지',
                    content: '2026년 7월부터 특정 파라벤류의 사용이 전면 금지됩니다.',
                    date: '2026-01-25'
                },
                {
                    type: 'info',
                    title: '동물실험 면제 절차 간소화',
                    content: 'NMPA가 면제 신청 절차를 간소화하여 처리 기간이 단축되었습니다.',
                    date: '2026-01-18'
                }
            ]
        },
        '일본': {
            flag: '🇯🇵',
            color: '#F59E0B',
            fullName: 'Japan',
            authority: 'MHLW (Ministry of Health, Labour and Welfare)',
            marketSize: '¥2.7T',
            marketGrowth: '+2.1% YoY',
            overview: '일본은 아시아 최대 선진 화장품 시장 중 하나로, 후생노동성(MHLW)의 규제를 받습니다. 의약부외품과 일반 화장품으로 구분되며, 비교적 명확한 규제 체계를 가지고 있습니다.',
            keyFeatures: [
                '의약부외품 vs 일반화장품 구분',
                '제조판매업 허가 필요',
                '일본어 전성분 표시 필수',
                '신속한 심사 프로세스'
            ],
            regulations: [
                {
                    id: 1,
                    title: '수입업자 및 제조판매업자 선정',
                    category: '필수',
                    priority: 'high',
                    description: '일본 내에서 화장품을 판매하기 위해서는 제조판매업 허가를 보유한 업체를 지정해야 합니다.',
                    timeline: '수출 전 필수',
                    cost: '¥300,000 - ¥500,000/년',
                    requirements: [
                        '제조판매업 허가 보유',
                        '책임기술자 배치',
                        '품질관리 체계',
                        '제품 리콜 능력'
                    ],
                    documents: ['제조판매업 허가증', '책임기술자 증명', '사업자 등록증'],
                    links: ['https://www.mhlw.go.jp']
                },
                {
                    id: 2,
                    title: '일본 화장품 기준 성분 검토',
                    category: '필수',
                    priority: 'high',
                    description: '후생노동성이 정한 화장품 기준에 따라 성분을 검토하고, 필요시 포뮬라를 조정합니다.',
                    timeline: '3-4주',
                    cost: '¥100,000 - ¥300,000',
                    requirements: [
                        '네거티브 리스트 확인',
                        '포지티브 리스트 확인 (방부제, 자외선차단제 등)',
                        '배합 한도 준수',
                        '금지 성분 확인'
                    ],
                    documents: ['전성분 리스트 (일문)', '원료 규격서', 'CoA'],
                    links: ['https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kenkou_iryou/iyakuhin/keshouhin/index.html']
                },
                {
                    id: 3,
                    title: '제조판매 신고',
                    category: '필수',
                    priority: 'high',
                    description: '일반 화장품의 경우 제조판매 신고서를 제출해야 합니다.',
                    timeline: '2-4주',
                    cost: '¥50,000 - ¥150,000',
                    requirements: [
                        '제품 표준서',
                        '전성분 목록',
                        '제조방법 개요',
                        '품질관리 방법'
                    ],
                    documents: ['제품 표준서', '제조방법서', '시험성적서'],
                    links: ['https://www.mhlw.go.jp']
                },
                {
                    id: 4,
                    title: '일본어 라벨 작성',
                    category: '필수',
                    priority: 'high',
                    description: '약기법에 따른 일본어 표시를 작성하고 검토받아야 합니다.',
                    timeline: '2-3주',
                    cost: '¥80,000 - ¥200,000',
                    requirements: [
                        '제품명 (일문)',
                        '제조판매업자 명칭 및 주소',
                        '전성분 표시 (일문)',
                        '내용량, 사용기한',
                        '사용상 주의사항'
                    ],
                    documents: ['라벨 디자인', '전성분 번역본', '표시 검토서'],
                    links: ['https://www.mhlw.go.jp']
                },
                {
                    id: 5,
                    title: 'GMP 인증 (권장)',
                    category: '권장',
                    priority: 'medium',
                    description: 'ISO 22716 등 GMP 인증은 필수는 아니지만, 품질 신뢰도를 높이는 데 유용합니다.',
                    timeline: '4-8주',
                    cost: '¥200,000 - ¥500,000',
                    requirements: [
                        '제조시설 적격성 평가',
                        '품질관리 시스템 구축',
                        '작업 표준서 작성',
                        '정기 내부 감사'
                    ],
                    documents: ['GMP 인증서', '품질 매뉴얼', '제조 기록'],
                    links: ['https://www.mhlw.go.jp']
                }
            ],
            roadmap: [
                { step: 1, title: '수입업자 선정', duration: '2주', status: 'start' },
                { step: 2, title: '성분 검토', duration: '3주', status: 'process' },
                { step: 3, title: '제품 신고', duration: '4주', status: 'process' },
                { step: 4, title: '일문 라벨 작성', duration: '3주', status: 'process' },
                { step: 5, title: 'GMP 인증 (선택)', duration: '6주', status: 'optional' },
                { step: 6, title: '수출 개시', duration: '-', status: 'complete' }
            ],
            estimatedTime: '3-5개월',
            estimatedCost: '¥800,000 - ¥1,500,000',
            requiredDocuments: [
                '제조판매업 허가증',
                '전성분 리스트 (일문)',
                '제품 표준서',
                'GMP 인증서',
                '제조방법서',
                '시험성적서'
            ],
            alerts: [
                {
                    type: 'info',
                    title: '화장품 기준 개정',
                    content: '2026년부터 새로운 방부제 기준이 적용됩니다.',
                    date: '2026-01-20'
                },
                {
                    type: 'info',
                    title: '전성분 표시 의무화 강화',
                    content: '2026년 4월부터 향료 성분도 상세 표시가 권장됩니다.',
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
                    @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@400;500;600;700;800&display=swap');
                    * { font-family: 'DM Sans', sans-serif; }
                    .serif-font { font-family: 'Instrument Serif', serif; }
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
                @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@400;500;600;700;800&display=swap');
                * { font-family: 'DM Sans', sans-serif; }
                .serif-font { font-family: 'Instrument Serif', serif; }
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