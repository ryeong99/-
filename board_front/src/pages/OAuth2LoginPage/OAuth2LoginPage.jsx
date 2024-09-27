import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { instance } from '../../apis/util/instance';

function OAuth2LoginPage(props) {
    const [searchParams] = useSearchParams();
    const navigete = useNavigate();
    
    useEffect(() => {
        const accessToken = searchParams.get("accessToken");
        if(!accessToken) {
            navigete("잘못된 접근입니다.");
            alert("잘못된 접근입니다.");
        }
        localStorage.setItem("accessToken", "Bearer " + accessToken);
        instance.interceptors.request.use(config => {
            config.headers["Authorization"] = localStorage.getItem("accessToken");
            return config;
        });
        navigete("/");
    },[]);
    
    return (
        <></>
    );
}

export default OAuth2LoginPage;