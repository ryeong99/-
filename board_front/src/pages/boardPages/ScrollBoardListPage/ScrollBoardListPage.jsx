import { css } from '@emotion/react';
import React, { useEffect, useRef, useState } from 'react';
import { IoMdHeart } from 'react-icons/io';
import { useInfiniteQuery } from 'react-query';
import { Link, useNavigate } from 'react-router-dom';
import { instance } from '../../../apis/util/instance';
/** @jsxImportSource @emotion/react */

const layout = css`
    margin: 0 auto;
    width: 1030px;
    background-color: #fafafa;
`;

const cardLayout = css`
    display: flex;
    flex-wrap: wrap;
    border-top: 3px solid #dbdbdb;
    padding: 0;
    padding-top: 50px;
    width: 100%;
    list-style-type: none;
`;

const card = css`
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    margin: 0 0 20px;
    border-bottom-left-radius: 5px;
    border-bottom-right-radius: 5px;
    width: 330px;
    height: 330px;
    box-shadow: 0 3px 5px 0px #00000022 ;
    cursor: pointer;
    
    // justfyContent: space-between을 주면 마지막에 2개 나올 경우 정렬이 이상해짐
    // 그래서 마진으로 주어야 함
    &:nth-of-type(3n-1) {
        margin: 0 20px 40px;
    }

    &:hover {
        transform: translateY(-2%);
        box-sizing: 0 3px 3px #00000022;
    }
`;

const cardMain = css`
    display: flex;
    flex-direction: column;
    flex-grow: 1;
`;

const cardImg = css`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 170px;
    overflow: hidden;
    background-color: #000000;

    & > img {
        width: 100%;
    }
`;

const cardContent = (isShowImg) => css`
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    padding: 10px;

    & > h3 {
        margin: 0px 0px 4px;
        width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    & > div {
        display: -webkit-box;
        overflow: hidden;
        word-break: break-all;
        -webkit-line-clamp: ${isShowImg ? 3 : 6};
        -webkit-box-orient: vertical;
        text-overflow: ellipsis;
        & > * {
            margin: 0px;
            font-size: 16px;
            font-weight: 400;
        }
    }
`;

const cardFooter = css`
    box-sizing: border-box;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid #f5f5f5;
    padding: 0px 15px;
    height: 50px;

    & > div:nth-of-type(1) {
        display: flex;
        font-weight: 600;
        align-items: center;
        & > img{
            margin-right: 5px;
            border: 1px solid #dbdbdb;
            border-radius: 50%;
            width: 20px;
            height: 20px;
        }

        & > span {
            margin-right: 10px;
            font-weight: 400;
            font-size: 14px;
            color: #999999;
        }
        
    }

    & > div:nth-of-type(2) {
        display: flex;
        align-items: center;
        & > span {
            line-height: 10px;
        }
    }
`;

function ScrollBoardListPage(props) {
    const navigate = useNavigate();
    const loadMoreRef = useRef(null);
    const limit = 20;

    const boardList = useInfiniteQuery(
        ["boardScrollQuery"],
        async ({ pageParam = 1 }) => await instance.get(`/board/list?page=${pageParam}&limit=${limit}`),
        {
            getNextPageParam: (lastPage, allpage) => {
                const totalPageCount = lastPage.data.totalPageCount % limit === 0
                ? lastPage.data.totalCount / limit
                : Math.floor(lastPage.data.totalCount / limit) + 1;
                
                return totalPageCount !== allpage.length ? allpage.length + 1 : null;
            }
        }
    );

    useEffect(() => {
        if(!boardList.hasNextPage || !loadMoreRef.current) {
            return;
        }

        const observer = new IntersectionObserver((entries) =>  {
            if(entries[0].isIntersecting) {
                boardList.fetchNextPage();
            }    
        }, {threshold: 1.0});

        observer.observe(loadMoreRef.current);

        return () => observer.disconnect();
    }, [boardList.hasNextPage]);

    return (
        <div css={layout}>
            <Link to={"/"}><h1>사이트 로고</h1></Link>
            <ul css={cardLayout}>
                {
                    boardList.data?.pages.map(page => page.data.boards.map(board => {
                        const mainImgStartIndex = board.content.indexOf("<img");
                        let mainImg = board.content.slice(mainImgStartIndex);
                        mainImg = mainImg.slice(0, mainImg.indexOf(">") + 1);
                        const mainImgSrc = mainImg.slice(mainImg.indexOf("src") + 5, mainImg.length - 2)
                        
                        let mainContent = board.content;
                        while (true) {
                            const pIndex = mainContent.indexOf("<p>")
                            if (pIndex === -1) {
                                mainContent = "";
                                break;
                            }
                            mainContent = mainContent.slice( pIndex + 3);
                            if(mainContent.indexOf("<img") !== 0) {
                                if(mainContent.includes("<img")) {
                                    mainContent = mainContent.slice(0, mainContent.indexOf("<img"));
                                    break;
                                }
                                mainContent = mainContent.slice(0, mainContent.indexOf("</p>"));
                                break;
                            }
                        }

                        return (
                            <li key={board.id} css={card} onClick={() => navigate(`/board/detail/${board.id}`)}>
                            <main css={cardMain}>
                                {
                                    mainImgStartIndex != -1 &&
                                    <div css={cardImg}>
                                        <img src={mainImgSrc} alt="" />
                                    </div>
                                }
                                <div css={cardContent(mainImgStartIndex != -1 ? true : false)}>
                                    <h3>{board.title}</h3>
                                    <div dangerouslySetInnerHTML = {{ __html : mainContent}}></div>
                                </div>
                            </main>
                            <footer css={cardFooter}>
                                <div>
                                    <img src={board.writerProfileImg} alt="" />
                                    <span>by </span>
                                    {board.writerName}
                                </div>
                                <div><IoMdHeart /><span>{board.likeCount}</span></div>
                            </footer>
                        </li>
                        )
                    }))
                }
            </ul>
            <div ref={loadMoreRef}></div>
        </div>
    );
}

export default ScrollBoardListPage;