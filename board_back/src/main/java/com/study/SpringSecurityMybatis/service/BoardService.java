package com.study.SpringSecurityMybatis.service;

import com.study.SpringSecurityMybatis.dto.request.ReqBoardListDto;
import com.study.SpringSecurityMybatis.dto.request.ReqSearchBoardDto;
import com.study.SpringSecurityMybatis.dto.request.ReqWriteBoardDto;
import com.study.SpringSecurityMybatis.dto.response.RespBoardDetailDto;
import com.study.SpringSecurityMybatis.dto.response.RespBoardLikeInfoDto;
import com.study.SpringSecurityMybatis.dto.response.RespBoardListDto;
import com.study.SpringSecurityMybatis.entity.Board;
import com.study.SpringSecurityMybatis.entity.BoardLike;
import com.study.SpringSecurityMybatis.entity.BoardList;
import com.study.SpringSecurityMybatis.exception.NotFoundBoardException;
import com.study.SpringSecurityMybatis.repository.BoardLikeMapper;
import com.study.SpringSecurityMybatis.repository.BoardMapper;
import com.study.SpringSecurityMybatis.repository.CommentMapper;
import com.study.SpringSecurityMybatis.security.principal.PrincipalUser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Objects;

@Service
public class BoardService {

    @Autowired
    private BoardLikeMapper boardLikeMapper;

    @Autowired
    private BoardMapper boardMapper;

    @Autowired
    private CommentMapper commentMapper;

    public Long writeBoard(ReqWriteBoardDto dto) {
        PrincipalUser principalUser = (PrincipalUser) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();

        Board board = dto.toEntity(principalUser.getId());
        boardMapper.save(board);
        return board.getId();
    }

    public RespBoardListDto getSearchBoard(ReqSearchBoardDto dto) {
        Long startIndex = (dto.getPage() - 1) * dto.getLimit();
        Map<String, Object> params = Map.of(
                "startIndex", startIndex,
                "limit", dto.getLimit(),
                "searchValue", dto.getSearch() == null ? "" : dto.getSearch(),
                "option", dto.getOption() == null ? "all" : dto.getOption()
        );
        List<BoardList> boardLists = boardMapper.findAllBySearch(params);
        Integer boardTotalCount = boardMapper.getCountAllBySearch(params);
        return RespBoardListDto.builder()
                .boards(boardLists)
                .totalCount(boardTotalCount)
                .build();
    }

    public RespBoardDetailDto getBoardDetail(Long boardId) {
        Board board = boardMapper.findById(boardId);
        if(board == null) {
            throw new NotFoundBoardException("해당 게시글을 찾을 수 없습니다.");
        }
        boardMapper.modifyViewCountById(boardId);
//        board.setViewCount(board.getViewCount() + 1);
        return RespBoardDetailDto.builder()
                .boardId(board.getId())
                .title(board.getTitle())
                .content(board.getContent())
                .writerId(board.getUserId())
                .writerUsername(board.getUser().getUsername())
                .viewCount(board.getViewCount() + 1)
                .build();
    }

    @Transactional(rollbackFor = Exception.class)
    public RespBoardLikeInfoDto getBoardLike(Long boardId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Long userId = null;
        if(!authentication.getName().equals("anonymousUser")) {
            PrincipalUser principalUser = (PrincipalUser) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            userId = principalUser.getId();
        }
        BoardLike boardLike = boardLikeMapper.findByBoardIdAndUserId(boardId, userId);
        int likeCount = boardLikeMapper.getLikeCountByBoardId(boardId);
        return RespBoardLikeInfoDto.builder()
                .boardLikeId(boardLike == null ? 0 : boardLike.getId())
                .likeCount(likeCount)
                .build();
    }

    public void like(Long boardId) {
        PrincipalUser principalUser = (PrincipalUser) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        // 로그인이 된 건지 확인한다.
        BoardLike boardLike = BoardLike.builder()
                .boardId(boardId)
                .userId(principalUser.getId())
                // 여기에 넣는다.
                .build();
        boardLikeMapper.save(boardLike);
    }

    public RespBoardListDto getBoardList(ReqBoardListDto dto) {
        Long startIndex = (dto.getPage() - 1) * dto.getLimit();
        List<BoardList> boardLists = boardMapper.findAllByStartIndexAndLimit(startIndex, dto.getLimit());
        Integer boardTotalCount = boardMapper.getCountAll();
        return RespBoardListDto.builder()
                .boards(boardLists)
                .totalCount(boardTotalCount)
                .build();

    }

    public void dislike(Long boardLikeId) {
        boardLikeMapper.deleteById(boardLikeId);
    }

    @Transactional(rollbackFor = Exception.class) // 아래매퍼를 실행하다가 에러가 뜨면 모두 실행되기 전으로 되돌려준다.
    public void deleteBoard(Long boardId) {
        boardMapper.deleteByBoardId(boardId);
        boardLikeMapper.deleteById(boardId);
        commentMapper.deleteByBoardId(boardId);
    }
}
