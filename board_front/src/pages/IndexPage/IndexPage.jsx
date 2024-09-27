import { css } from '@emotion/react';
import { useRef, useState } from 'react';
import { useQueryClient } from 'react-query';
import { Link, useNavigate } from 'react-router-dom';
/** @jsxImportSource @emotion/react */

const layout = css`
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 100px 300px;
`;

const header = css`
    display: flex;
    justify-content: center;
    margin-bottom: 40px;

    & > input {
        box-sizing: border-box;
        width: 50%;
        height: 50px;
        border-radius: 50px;
        padding: 10px 20px;
    }
`;

const main = css`
    display: flex;
    justify-content: space-between;

`;

const leftBox = css`
    box-sizing: border-box;
    border: 2px solid #dbdbdb;
    border-radius: 10px;
    width: 64%;

    & > a {
        margin-right: 20px;
    }
`;

const rightBox = css`
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: center;
    border: 2px solid #dbdbdb;
    border-radius: 10px;
    width: 35%;
    padding: 20px;

    & > button {
        width: 100%;
        height: 40px;
        font-size: 16px;
        font-weight: 600;
    }

    & > div {
        display: flex;
        justify-content: center;
        width: 100%;

        & > a:not(:nth-last-of-type(1))::after {
            display: inline-block;
            content: " ";
            margin: 0px 5px;
            height: 60%;
            border-left: 1px solid #222222;
        }
    }
`

const userInfoBox = css`
    display: flex;
    justify-content: flex-start;
    width: 100%;

`;

const profileImgBox = css`
    box-sizing: border-box;
    display:flex ;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
    width: 64px;
    height: 64px;
    box-shadow: 0px 0px 2px #00000088;
    cursor: pointer;
    overflow: hidden;
    & > img {
        height: 100%;
    }
`;

const profileInfo = css`
    box-sizing: border-box;
    display: flex;
    justify-content: space-between;
    flex-grow: 1;
    padding: 10px;

    & > button {
        box-sizing: border-box;
        border: 1px solid #dbdbdb;
        border-radius: 37px;
        height: 37px;
        padding: 5px 10px;
        background-color: #ffffff;
        color: #555555;
        font-size: 16px;
        cursor: pointer;
    }
`;

function IndexPage(propse) {

    const navigator = useNavigate();

    const queryClient = useQueryClient();
    const accessTokenValidState = queryClient.getQueryState("accessTokenValidQuery")
    const userInfoState = queryClient.getQueryState("userInfoQuery")
    const [searchValue, setSearchValue] = useState("");

    const handleSearchInputOnChange = (e) => {
        setSearchValue(e.target.value);
    }

    const handleSearchInputOnKeyDown = (e) => {
        if(e.keyCode === 13) {
            navigator(`/board/search?page=1&option=all&search=${searchValue}`);
        }
    }

    const loginButton = () => {
        navigator("/user/login");
    }

    const handleLogoutButtonOnClick = () => {
        localStorage.removeItem("accessToken");
        window.location.replace("/");
    }

    return (
        <div css={layout}>
            <header css={header}>
                <input type='search' 
                onChange={handleSearchInputOnChange}  
                onKeyDown={handleSearchInputOnKeyDown}
                placeholder='검색어를 입력해주세요.' />
            </header>

            <main css={main}>
                <div css={leftBox}>
                    <Link to={"/board/number?page=1"}>"게시글(number)"</Link>
                    <Link to={"/board/scroll"}>"게시글(scroll)"</Link>
                    <Link to={"/board/search?page=1"}>"게시글 검색"</Link>
                    <Link to={"/board/write"}>글쓰기</Link>
                    <Link to={"/mail"}>메일전송</Link>
                </div>
                {
                    accessTokenValidState.status !== "success"
                    ?
                    accessTokenValidState.status !== "error"
                    ?
                    <></>
                    :
                    <div css={rightBox}>
                        <p>더 안전하고, 더 편리하게</p>
                        <button onClick={loginButton}>로그인</button>
                        <div>
                            <Link to={"user/help/id"}>아이디 찾기</Link >
                            <Link to={"user/help/pw"}>비밀번호 찾기</Link>
                            <Link to={"user/join"}>회원가입</Link>
                        </div>
                    </div>
                    :
                    <div css={rightBox}>
                        <div css={userInfoBox}>
                            <div css={profileImgBox} onClick={() => navigator("/profile")}> 
                                <img src={userInfoState?.data?.data.img} alt="" />
                            </div>
                            <div css={profileInfo}>
                                <div>
                                    <div>{userInfoState.data?.data.username}님</div>
                                    <div>{userInfoState.data?.data.email}</div>
                                </div>
                                <button onClick={handleLogoutButtonOnClick}>로그아웃</button>
                            </div>
                        </div>
                    </div>
                }
            </main>
        </div>
    );
}

export default IndexPage;