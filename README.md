# COSY

## fastapi를 위한 환경 세팅
1. Python 3.10.x 설치
2. pycharm, vscode 준비 (개발은 pycharm으로 진행)
3. fastapi 디렉토리에서 cmd 열기
4. py -3.10 -m venv .venv → 가상환경 생성
5. .venv\Scripts\activate → 가상환경 실행. 실행 후 프롬프트에 (.venv)가 붙었으면 성공적으로 가상환경에 접속한 것
6. python -m pip install --upgrade pip
7. pip install -r requirements.txt
(버전 체크 생략)
8. uvicorn app.main:app --host 127.0.0.1 --port 8000
9. 인터넷 주소창에 http://127.0.0.1:8000/docs으로 접속하면 api 확인 가능
