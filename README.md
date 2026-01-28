# COSY

## fastapi를 로컬에서 돌리기 위한 환경 세팅
1. Python 3.10.x 설치
- 그 이상은 paddle ocr이 안됨
- 기존 버전이 3.10.x 이상이면 삭제할 필요 없이 추가로 3.10.x 버전 다운로드
- 이후 py -3.10 --version으로 버전 체크하고 다음 스텝으로 넘어가기
2. fastapi 디렉토리에서 cmd 열기
3. py -3.10 -m venv .venv → 가상환경 생성
4. .venv\Scripts\activate → 가상환경 실행. 실행 후 프롬프트에 (.venv)가 붙었으면 성공적으로 가상환경에 접속한 것
5. python -m pip install --upgrade pip
6. pip install -r requirements.txt
- 상당히 오래 걸림
7. uvicorn app.main:app --host 127.0.0.1 --port 8000
8. 인터넷 주소창에 http://127.0.0.1:8000/docs으로 접속하면 api 확인 가능
9. .env는 gitignore에 명시된 파일로 직접 생성 → openapi api key, llm model, embedding model 등에 대한 정의가 포함되어 있는 민감정보이므로 필요 시 담당자에게 문의해주세요
