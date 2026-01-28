const OCR_BASE = import.meta.env.VITE_OCR_BASE_URL;

export async function ocrExtractText(file, lang = "korean") {
  const fd = new FormData();

  //FastAPI(ocr.py)에서 UploadFile 파라미터 이름이 image임
  fd.append("image", file);

  //prefix는 프로젝트에 따라 다를 수 있음 (예: /v1/ocr)
  const url = `${OCR_BASE}/v1/ocr/extract?lang=${encodeURIComponent(lang)}`;

  const res = await fetch(url, {
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
}
