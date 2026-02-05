import axios from "axios";

const API_URL = "http://localhost:8080/api/log"; // 백엔드 주소에 맞게 수정

export const getInspectionLogs = async () => {
    const token = localStorage.getItem("cosy_access_token");
    const response = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const getLogsByCountry = async (country) => {
    const token = localStorage.getItem("cosy_access_token");
    const response = await axios.get(`${API_URL}/${country}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

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