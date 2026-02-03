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
7. python -m app.scripts.ingest_regulations → 해야 rag에 쓰일 벡터db 생성됨
8. uvicorn app.main:app --host 127.0.0.1 --port 8000
9. 인터넷 주소창에 http://127.0.0.1:8000/docs으로 접속하면 api 확인 가능
10. .env는 gitignore에 명시된 파일로 직접 생성 → openapi api key, llm model, embedding model 등에 대한 정의가 포함되어 있는 민감정보이므로 필요 시 담당자에게 문의해주세요

---
## redis를 로컬에 돌리기 위한 환경 세팅 (Docker 사용)

### 1. 사전 준비 사항

#### Docker 설치 확인

Redis는 Docker 컨테이너로 실행합니다.  
먼저 Docker가 설치되어 있는지 확인해주세요.  
  
터미널(명령 프롬프트)에서 아래 명령어를 실행합니다.  

```bash
docker --version

```
만약 버전 정보가 뜬다면 이미 깔려있는 것, 그런 커맨드 없다고 하면 새로 설치해야함  
Docker 설치 후에는 반드시 Docker Desktop을 실행한 상태여야 함  


### 2. Redis 컨테이너 실행
아래 명령어 한 줄만 실행하면 Redis가 로컬에서 실행됩니다.  
```bash
docker run -d --name local-redis -p 6379:6379 redis:7
```
참고 설명 (이해하지 않아도 됩니다)  
  
-d : 백그라운드 실행  
--name local-redis : 컨테이너 이름  
6379 : Redis 기본 포트  
redis:7 : Redis 버전 7  


### 3. Redis 실행 상태 확인
아래 명령어를 실행합니다.  
```bash
docker ps

```

아래와 비슷한 출력이 보이면 정상입니다.
```
CONTAINER ID   IMAGE     NAME          PORTS
xxxxxx         redis:7   local-redis   0.0.0.0:6379->6379/tcp
```

### 4. Redis 접속 테스트 (선택)
Redis가 실제로 동작하는지 확인하고 싶다면 아래 명령어를 실행합니다.  
```bash
docker exec -it local-redis redis-cli
```
Redis 콘솔에서 다음을 입력합니다.  
```bash
PING
```
아래처럼 나오면 정상입니다.  

```
PONG
```
종료하려면:  
``` bash
exit
```

### 5. 애플리케이션에서 Redis 접속 정보
애플리케이션에서는 아래 정보로 Redis에 접속하면 됩니다.  
```bash
HOST: localhost
PORT: 6379
PASSWORD: 없음
```
예시 환경 변수:  
REDIS_HOST=localhost  
REDIS_PORT=6379  

### 6. Redis 컨테이너 제어

Redis 중지  
```bash
docker stop local-redis
```

Redis 다시 시작  
``` bash
docker start local-redis
```

Redis 컨테이너 삭제 (완전히 제거)  
``` bash
docker rm -f local-redis
```

삭제 후 다시 실행하려면 2번 단계 명령어를 다시 실행하면 됩니다.  

7. 자주 발생하는 문제
포트 6379가 이미 사용 중이라는 오류가 나는 경우
이미 다른 Redis나 서비스가 해당 포트를 사용 중일 수 있습니다.  
이 경우 포트를 변경해서 실행합니다.  
``` bash
docker run -d \
  --name local-redis \
  -p 6380:6379 \
  redis:7
```

이 경우 애플리케이션에서도 포트를 6380으로 맞춰야 합니다.  
```
REDIS_PORT=6380
```


