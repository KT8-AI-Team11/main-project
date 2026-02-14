import re
import json
from typing import List, Dict, Any, Optional
import redis
from app.services.llm_service import LlmService

def _canon(s: str) -> str:
    s = (s or "").strip().lower()
    s = re.sub(r"\s+", "", s)
    s = re.sub(r"[()\[\]{}.,;:/\\|\"'`~!@#$%^&*_+=<>?-]", "", s)
    return s

def _dedup(items: List[str]) -> List[str]:
    seen = set()
    out = []
    for x in items:
        if not x:
            continue
        x = x.strip()
        if not x:
            continue
        k = _canon(x)
        if k in seen:
            continue
        seen.add(k)
        out.append(x)
    return out

class QueryExpander:
    """
    - 입력 query 전체에서 성분 후보들을 찾아 확장하기는 어렵기 때문에
      1) ingredients 도메인에서는: ingredients 원문을 그대로 포함 + 캐시 기반 aliases를 OR로 확장
      2) labeling 도메인에서는: 확장 안 하거나 아주 약하게만
    """
    def __init__(self, redis_client: redis.Redis, llm_service: Optional[LlmService] = None, ttl_seconds: int = 60*60*24*180, max_llm_calls_per_request: int = 2):
        self.r = redis_client
        self.llm = llm_service
        self.ttl = ttl_seconds
        self.max_llm_calls_per_request = max_llm_calls_per_request

    def expand_ingredients_query(self, rag_query: str, ingredients_text: str) -> str:
        ingredients = self._split_ingredients(ingredients_text)

        extra_terms: List[str] = []
        llm_calls = 0

        for ing in ingredients:
            aliases = self._get_cached_aliases(ing)

            # 캐시 miss면 LLM로 생성(요청당 최대 N개)
            if (not aliases) and self.llm and llm_calls < self.max_llm_calls_per_request:
                aliases = self._generate_and_cache_aliases(ing)
                if aliases:
                    llm_calls += 1

            if aliases:
                extra_terms.extend(aliases)
            else:
                extra_terms.extend([ing, ing.replace(" ", "")])

        extra_terms = _dedup(extra_terms)[:30]
        or_block = " OR ".join([f"\"{t}\"" for t in extra_terms])

        syn_line = "Synonyms: " + ", ".join(extra_terms[:15])
        return rag_query + "\n\n" + syn_line + "\n\n[Synonym Expansion]\n" + or_block


    def expand_labeling_query(self, rag_query: str) -> str:
        # labeling은 성분명 매칭이 핵심이 아니니 기본은 그대로 반환
        return rag_query

    def _get_cached_aliases(self, ingredient: str) -> List[str]:
        key = f"ing_alias:{_canon(ingredient)}"
        try:
            raw = self.r.get(key)
        except Exception:
            return []

        if not raw:
            return []

        try:
            data = json.loads(raw)
            aliases = data.get("aliases") or []
            return _dedup([ingredient] + aliases)
        except Exception:
            return []

    def _generate_and_cache_aliases(self, ingredient: str) -> List[str]:
        """
        LLM로 canonical/aliases를 생성하고 Redis에 저장.
        실패하면 [] 반환(검색은 계속 진행)
        """
        try:
            data = self.llm.normalize_ingredient(ingredient)
        except Exception:
            return []

        canonical = (data.get("canonical") or "").strip()
        aliases = data.get("aliases") or []
        cas = data.get("cas")

        merged = _dedup([ingredient, canonical] + aliases)
        merged = [x for x in merged if x]  # 빈값 제거

        # 저장 (canonical/aliases/cas)
        payload = {"canonical": canonical, "aliases": merged, "cas": cas}

        # 같은 물질을 여러 키로 접근 가능하게 저장하면 hit율↑
        keys_to_set = {f"ing_alias:{_canon(ingredient)}"}
        if canonical:
            keys_to_set.add(f"ing_alias:{_canon(canonical)}")
        for a in merged[:6]:  # 너무 많이 키 늘리지 말고 상위 몇개만
            keys_to_set.add(f"ing_alias:{_canon(a)}")

        try:
            for k in keys_to_set:
                self.r.setex(k, self.ttl, json.dumps(payload, ensure_ascii=False))
        except Exception:
            # 캐시 저장 실패해도 검색은 진행
            pass

        return merged

    def _split_ingredients(self, text: str) -> List[str]:
        # 쉼표/줄바꿈 기준 분리 + 괄호 안 함량 같은 건 그대로 두되 앞뒤 trim
        parts = re.split(r"[,\\n]+", text or "")
        return [p.strip() for p in parts if p.strip()]
