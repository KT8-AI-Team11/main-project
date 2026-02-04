export const saveInspectionLog = async (logData) => {
    const token = localStorage.getItem("cosy_access_token");

    const response = await fetch("http://localhost:8080/api/log", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(logData)
    });

    if (!response.ok) {
        throw new Error(`백엔드 저장 실패: ${response.status}`);
    }

    return response.text();
};