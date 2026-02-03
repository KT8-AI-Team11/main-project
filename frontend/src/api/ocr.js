// src/api/ocr.js
// FastAPI OCR 연동
// - POST /v1/ocr/extract?lang=korean
// - form-data key: image

const OCR_BASE_PROD = import.meta.env.VITE_OCR_BASE_URL || "";
// DEV에선 vite proxy를 쓰기 위해 base를 비워서 상대경로로 호출
const OCR_BASE = import.meta.env.DEV ? "" : OCR_BASE_PROD;

const OCR_PATH = import.meta.env.VITE_OCR_EXTRACT_PATH || "/v1/ocr/extract";

function buildUrl(lang = "korean") {
  // base가 비어있으면 현재 origin 기준으로 상대경로 호출 (vite proxy 타게 됨)
  const base = OCR_BASE || window.location.origin;
  const u = new URL(OCR_PATH, base);
  u.searchParams.set("lang", lang);
  return u.toString();
}

export async function ocrExtract(file, { lang = "korean" } = {}) {
  if (!file) throw new Error("이미지 파일이 없습니다.");

export async function ocrExtractText(file, lang = "korean") {
  const fd = new FormData();

  //FastAPI(ocr.py)에서 UploadFile 파라미터 이름이 image임
  fd.append("image", file);

  //prefix는 프로젝트에 따라 다를 수 있음 (예: /v1/ocr)
  const url = `${OCR_BASE}/v1/ocr/extract?lang=${encodeURIComponent(lang)}`;

  const res = await fetch(url, {
  const fd = new FormData();
  fd.append("image", file); // ✅ FastAPI 필드명은 image

  const res = await fetch(buildUrl(lang), {
    method: "POST",
    body: fd,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    // FastAPI는 보통 { detail: "..." } 형태가 많음
    const msg = data?.detail || data?.message || "OCR 요청 실패";
    throw new Error(msg);
  }

  //응답에 text가 있음
  return data?.text ?? "";
    // FastAPI는 보통 {detail: "..."} 형태로 에러를 줌
    const msg = data?.message || data?.detail || "OCR 요청 실패";
    throw new Error(msg);
  }

  // 표준 응답: { language, text, lines[] }
  const text =
    typeof data?.text === "string"
      ? data.text
      : Array.isArray(data)
      ? data.map((x) => x?.text).filter(Boolean).join("\n")
      : "";

  return {
  language: data?.language || lang,
  text,
  normalized_text: data?.normalized_text ?? text, //
  lines: Array.isArray(data?.lines) ? data.lines : Array.isArray(data) ? data : [],
  raw: data,
};
}
