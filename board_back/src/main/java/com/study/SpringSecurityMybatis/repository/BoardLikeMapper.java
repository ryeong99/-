package com.study.SpringSecurityMybatis.repository;

import com.study.SpringSecurityMybatis.entity.BoardLike;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface BoardLikeMapper {
    int save(BoardLike boardLike);
    int deleteById(Long id);
    // 성공 카운트만 알면 되는 경우
    BoardLike findByBoardIdAndUserId(@Param("boardId") Long boardId,
                                     @Param("userId") Long UserId);
    // 받아올 정보가 필요한 경우
    int getLikeCountByBoardId(Long boardId);
}