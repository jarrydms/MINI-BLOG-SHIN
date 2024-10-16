import React, { useState, useEffect } from "react"; // useEffect 추가
import { BrowserRouter, Routes, Route } from "react-router-dom";
import styled from "styled-components";
import axios from "axios"; // axios 추가
import MainPage from './component/page/MainPage';
import PostWritePage from './component/page/PostWritePage';
import PostViewPage from './component/page/PostViewPage';
import PostEditPage from './component/page/PostEditPage';
import AuthPage from './component/page/AuthPage';  // 사용자 인증 페이지

const MainTitleText = styled.p`
    font-size: 24px;
    font-weight: bold;
    text-align: center;
`;

function App() {
    const [posts, setPosts] = useState([]);

    console.log('App.js - posts 상태:', posts);
    // json-server로부터 데이터를 불러오기 위해 useEffect 사용
    useEffect(() => {
        // 데이터를 로드하는 API 호출 (json-server 사용)
        axios.get('http://localhost:4000/posts') // json-server에서 posts 데이터를 가져옴
            .then(response => {
                setPosts(response.data);  // 서버에서 가져온 데이터를 상태로 설정
            })
            .catch(error => {
                console.error('데이터를 가져오는데 실패했습니다:', error);
            });
    }, []); // 컴포넌트가 마운트될 때 한 번만 호출

    // 게시글 추가
    const handleAddPost = (newPost) => {
        // 데이터를 추가하는 API 호출 (POST 요청)
        axios.post('http://localhost:4000/posts', newPost) // json-server에 새 게시글 추가
            .then(response => {
                setPosts([response.data, ...posts]);  // 서버에서 받은 데이터를 상태에 반영
            })
            .catch(error => {
                console.error('게시글 추가 중 오류가 발생했습니다:', error);
            });
    };

    // 게시글 삭제
    const handleDeletePost = (postId) => {
        // 데이터를 삭제하는 API 호출 (DELETE 요청)
        axios.delete(`http://localhost:4000/posts/${postId}`) // json-server에서 게시글 삭제
            .then(() => {
                const updatedPosts = posts.filter(post => post.id !== postId);
                setPosts(updatedPosts);  // 삭제 후 상태 업데이트
            })
            .catch(error => {
                console.error('게시글 삭제 중 오류가 발생했습니다:', error);
            });
    };

    // 게시글 수정
    const handleUpdatePost = (updatedPost) => {
        // 데이터를 수정하는 API 호출 (PUT 요청)
        axios.put(`http://localhost:4000/posts/${updatedPost.id}`, updatedPost) // json-server에서 게시글 수정
            .then(() => {
                const updatedPosts = posts.map(post => 
                    post.id === updatedPost.id ? updatedPost : post
                );
                setPosts(updatedPosts);  // 수정 후 상태 업데이트
            })
            .catch(error => {
                console.error('게시글 수정 중 오류가 발생했습니다:', error);
            });
    };

    // 댓글 추가 함수
    const handleAddComment = (postId, commentContent) => {
        // 해당 게시글을 찾음
        const postToUpdate = posts.find(post => post.id === postId);
        const newComment = {
            id: postToUpdate.comments.length + 1, // 새로운 댓글의 ID 설정
            content: commentContent
        };
        const updatedPost = {
            ...postToUpdate,
            comments: [...postToUpdate.comments, newComment] // 댓글을 게시글에 추가
        };

        // 게시글 수정 API 호출 (댓글 추가 반영)
        axios.put(`http://localhost:4000/posts/${postId}`, updatedPost) // json-server에서 댓글 포함하여 게시글 수정
            .then(() => {
                const updatedPosts = posts.map(post => 
                    post.id === postId ? updatedPost : post
                );
                setPosts(updatedPosts);  // 댓글 추가 후 상태 업데이트
            })
            .catch(error => {
                console.error('댓글 추가 중 오류가 발생했습니다:', error);
            });
    };

    return (
        <BrowserRouter>
            <MainTitleText>AWS 소개 블로그</MainTitleText>
            <Routes>
                <Route index element={<MainPage posts={posts} />} />
                <Route path="post-write" element={<PostWritePage onAddPost={handleAddPost} />} />
                <Route path="post/:postId" element={<PostViewPage posts={posts} onDeletePost={handleDeletePost} onAddComment={handleAddComment} />} /> {/* onAddComment 추가 */}
                <Route path="post/:postId/edit" element={<PostEditPage posts={posts} onUpdatePost={handleUpdatePost} />} />
                <Route path="auth/:postId/:action" element={<AuthPage posts={posts} onDeletePost={handleDeletePost} onUpdatePost={handleUpdatePost} />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;