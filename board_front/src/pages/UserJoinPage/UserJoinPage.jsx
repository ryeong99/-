import React, { useState } from 'react';
/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { signupApi } from '../../apis/util/signupApi';
import { useMutation } from 'react-query';
import { instance } from '../../apis/util/instance';

const layout = css`
    display: flex;
    flex-direction: column;
    margin: 0px auto;
    width: 460px;
`;

const logo = css`
    font-size: 24px;
    margin-bottom: 40px;
`;

const JoinInfoBox = css`
    display: flex;
    flex-direction: column;
    margin-bottom: 20px;
    width: 100%;

    & input {
        box-sizing: border-box;
        border: none;
        outline: none;
        width: 100%;
        height: 50px;
        font-size: 16px;
    }
    
    & p {
        margin: 0px 0px 10px 10px;
        color: #ff2f2f;
        font-size: 12px;
    }

    & div {
        box-sizing: border-box;
        width: 100%;
        border: 1px solid #dbdbdb;
        border-bottom: none;
        outline: none;
        padding: 0px 20px ;
    }

    & div:nth-of-type(1) {
            border-top-left-radius: 10px;
            border-top-right-radius: 10px;
    }
    
    & div:nth-last-of-type(1) {
    border-bottom: 1px solid #dbdbdb;
    border-bottom-left-radius: 10px;
    border-bottom-right-radius: 10px;
    }
    
`;
const joinButton = css`
    border: none;
    border-radius: 10px;
    width: 100%;
    height: 50px;
    background-color: #999999;
    color: #ffffff;
    font-size: 18px;
    font-weight: 600;
    cursor: pointer;
`;

function UserJoinPage(props) {
    const navigate = useNavigate();

    const [inputUser, setInputUser] = useState({
        username: "",
        password: "",
        checkPassword: "",
        name: "",
        email: ""
    });

    const [fieldErrorsMessages, setFieldErrorMessages] = useState({
        username: <></>,
        password: <></>,
        checkPassword: <></>,
        name: <></>,
        email: <></>,
    });

    const sendMail = useMutation(
        async ({toEmail, username}) => 
            await instance.post("/auth/mail", {toEmail, username})
    )

    const handleInputUserOnChange = (e) => {
        setInputUser(inputUser => ({
            ...inputUser,
            [e.target.name]: e.target.value
        }));
    }

    const handleJoinSubmitOnClick = async () => {
        const signupData = await signupApi(inputUser);
        if (!signupData.isSuccess) {
            showFieldErrorMessage(signupData.fieldErrors);
            return;
        }

        const toEmail = signupData.ok.user.email;
        const username = signupData.ok.user.username;
        await sendMail.mutateAsync({toEmail, username});
        navigate("/user/login");
    }

    const showFieldErrorMessage = (fieldErrors) => {
        let EmptyFieldErrors = {
            username: <></>,
            password: <></>,
            checkPassword: <></>,
            name: <></>,
            email: <></>,
        }

        for (let fieldError of fieldErrors) {
            EmptyFieldErrors = {
                ...EmptyFieldErrors,
                [fieldError.field]: <p>{fieldError.defaultMessage}</p>,
            }
        }

        setFieldErrorMessages(EmptyFieldErrors);
    }

    return (
        <div css={layout}>
            <Link to={"/"}><h1 css={logo}>사이트 로고</h1></Link>
            <div css={JoinInfoBox}>
                <div>
                    <input type='text' name='username' value={inputUser.username} onChange={handleInputUserOnChange} placeholder='아이디' />
                    {fieldErrorsMessages.username}
                </div>
                <div>
                    <input type='password' name='password' value={inputUser.password} onChange={handleInputUserOnChange} placeholder='비밀번호' />
                    {fieldErrorsMessages.password}
                </div>
                <div>
                    <input type='password' name='checkPassword' value={inputUser.checkPassword} onChange={handleInputUserOnChange} placeholder='비밀번호 확인' />
                    {fieldErrorsMessages.checkPassword}
                </div>
                <div>
                    <input type='text' name='name' value={inputUser.name} onChange={handleInputUserOnChange} placeholder='이름' />
                    {fieldErrorsMessages.name}
                </div>
                <div>
                    <input type='email' name='email' value={inputUser.email} onChange={handleInputUserOnChange} placeholder='이메일 주소' />
                    {fieldErrorsMessages.email}
                </div>
            </div>
            <button css={joinButton} onClick={handleJoinSubmitOnClick}>가입하기</button>
        </div>
    );
}

export default UserJoinPage;