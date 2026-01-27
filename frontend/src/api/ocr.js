const OCR_BASE = import.meta.env.VITE_OCR_BASE_URL;

export async function ocrExtract(file) {
  const fd = new FormData();
  fd.append("file", file); // <- 필드명만 내일 확정해서 수정

  const res = await fetch(`${OCR_BASE}/v1/ocr/extract`, {
    method: "POST",
    body: fd,
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.message || "OCR 요청 실패");

  return data?.text ?? ""; // <- 응답 키도 내일 확정
}
