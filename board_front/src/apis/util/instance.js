import axios from "axios";

export const instance = axios.create({
    baseURL:"http://localhost:8080",
        // 기본적으로 주소를 넣어줌
    headers: {
        //토큰정보를 넣어줌
        Authorization: localStorage.getItem("accessToken"),
    }
});