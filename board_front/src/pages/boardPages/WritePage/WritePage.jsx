import React, { useCallback, useMemo, useRef, useState } from 'react';
/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import ImageResize from 'quill-image-resize';
import { storage } from '../../../firebase/firebase';
import { v4 as uuid } from "uuid"; //Quill.register 보다 위에 있어야함
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { CircleLoader, SyncLoader } from 'react-spinners';
import axios, { all } from 'axios';
import { instance } from '../../../apis/util/instance';
import { useNavigate } from 'react-router-dom';
Quill.register("modules/imageResize", ImageResize); 

const layout = css`
    box-sizing: border-box;
    margin: 0px auto;
    padding-top: 50px;
    width: 1100px;

`;

const editorLayout = css`
    box-sizing: border-box;
    margin-bottom: 42px;
    width: 100%;
    height: 700px;

`;

const loadingLayout = css`
    position: absolute;
    left: 0%;
    top: 0%;
    z-index: 99;
    box-sizing: border-box;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    background-color: #00000033;
`;

const titleInput = css`
    box-sizing: border-box;
    margin-bottom: 10px;
    padding: 1px solid #c0c0c0c0;
    outline: none;
    padding: 12px 15px;
    width: 100%;
    font-size: 16px;
`;

const header = css`
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin: 10px 0px;

    & > h1 {
        margin: 0px;
    }

    & > button {
        box-sizing: border-box;
        border: 1px solid #c0c0c0c0;
        padding: 8px 15px;
        background-color: white;
        color: #333333;
        font-weight: 600;
        font-size: 12px;
        cursor: pointer;
        &:hover {
            background-color: #fafafa;
        }
        &:active {
            background-color: #eeeeee;
        }
    }
`;

function WritePage(props) {
    const navigate = useNavigate();

    const [                                                                                                           
        board, setBoard] = useState({
        title: "",
        content: ""
    });

    const quillRef = useRef(null);
    const [isUploadStatus, setUploadStatus] = useState(false);
    
    const handleWriteSubmit = async () => {
        try {
            const response = await instance.post("/board", board)
            // await이 있어야지만 board가 response에 담긴다 (호출하는 프로미스 앞에 달 수 있다.)
            alert("작성이 완료되었습니다.");
            navigate(`/board/detail/${response.data.boardId}`);
        } catch(error) {
            const fieldErrors = error.response.data;
                for(let fieldError of fieldErrors) {
                    if(fieldError.filed === "title") {
                        alert(fieldError.defaultMessage);
                        return;
                    }
                }
                for(let fieldError of fieldErrors) {
                    if(fieldError.filed === "content") {
                        alert(fieldError.defaultMessage);
                        return;
                    }
                }
        }
    };
    
    // const handleWriteSubmit = () => {
    //     instance.post("/board", board)
    //     // 앞에는 (주소값, 넣어줄 데이터)
    //         .then((response) => {
    //             // 요청에 응답이 오면 리스폰스라는 응답이온다.
    //             //.프로미스 (response.data에 저장)
    //             alert("작성이 완료되었습니다.");
    //             navigate(`/board/detail/${response.data.boardId}`);
    //         })  
    //         .catch((error) => {
    //             console.log(error);
    //             const fieldErrors = error.response.data;
    //             for(let fieldError of fieldErrors) {
    //                 // 필드에러스 들을 하나씩 가져오는 데 가져 온것을 필드 에러라고 부른다
    //                 if(fieldError.filed === "title") {
    //                     //만약 필드에러에서 필드가 == 타이틀이냐?
    //                     alert(fieldError.defaultMessage);
    //                     //맞으면 alert 동작 (필드에 디폴트 메세지 출력)
    //                     return;
    //                 }
    //             }
    //             for(let fieldError of fieldErrors) {
    //                 if(fieldError.filed === "content") {
    //                     alert(fieldError.defaultMessage);
    //                     return;
    //                 }
    //             }
    //         });

    // };

    const handleTitleInputOnchange = (e) => {
        setBoard(board => ({
            ...board,
            [e.target.name]: e.target.value
        }));
    }

    const handleQuillValueOnChange = (value) => {
        setBoard(board => ({
            ...board,
            content: quillRef.current.getEditor().getText().trim() === "" ? "" : value,
        }));
    }

    //랜더링 될 때 다시 재정의하지 않겠다.
    const handleImageLoad = useCallback(() => {
        const input = document.createElement("input");
        input.setAttribute("type", "file");
        input.click();

        input.onchange = () => {
            const editor = quillRef.current.getEditor();
            const files = Array.from(input.files);
            const imgFile =  files[0];

            const editPoint = editor.getSelection(true);
            
            const storageRef = ref(storage, `board/img/${uuid()}_${imgFile.name}`);
            const task = uploadBytesResumable(storageRef, imgFile);
            setUploadStatus(true);
            task.on(
                "state_changed",
                () => {},
                () => {},
                async () => {
                    const url = await getDownloadURL(storageRef);
                    editor.insertEmbed(editPoint.index, "image", url);
                    editor.setSelection(editPoint.index + 1);
                    editor.insertText(editPoint.index + 1, "\n");
                    setUploadStatus(false);
                    setBoard(board=> ({
                        ...board,
                        content: editor.root.innerHTML,
                    }));
                }
            );
        }

    },[]);

    const toolbarOptions = useMemo(() => [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        [{ 'font': [] }],
        ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
        [{ 'color': [] }, { 'background': [] }, { 'align': [] }],          // dropdown with defaults from theme
        [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'list': 'check' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
        ['link', 'image', 'video', 'formula'],
        ['blockquote', 'code-block'],
    ],[]);
      
    const quill = new Quill('#editor', {
        modules: {
          toolbar: toolbarOptions
        },
        theme: 'snow'
    });

    return (
        <div css={layout}>
            <header css={header}>
                <h1>Quill Edit</h1>
                <button onClick={handleWriteSubmit}>작성하기</button>
            </header>
            <input css={titleInput} type='text' onChange={handleTitleInputOnchange} name='title' value={board.title} placeholder='게시글의 제목을 입력하세요.'/>
            <div css={editorLayout}>
                {
                    isUploadStatus &&
                    <div css={loadingLayout}>
                        <SyncLoader />
                    </div>
                }
                <ReactQuill 
                    ref={quillRef}
                    style={{
                        boxsizing: "border-box",
                        width: "100%",
                        height: "100%",
                    }}
                    onChange={handleQuillValueOnChange}
                    modules={{

                        toolbar:{ toolbarOptions,
                            container: toolbarOptions,
                            handlers: {
                            image: handleImageLoad, 
                            }  
                        },
                            imageResize: {
                            parchment: Quill.import("parchment")
                        },
                        
                    }}
                />
        </div>
            </div>
    );
}

export default WritePage;