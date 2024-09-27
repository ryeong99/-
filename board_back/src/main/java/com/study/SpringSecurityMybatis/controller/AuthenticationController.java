package com.study.SpringSecurityMybatis.controller;

import com.study.SpringSecurityMybatis.aspect.annotation.ValidAop;
import com.study.SpringSecurityMybatis.dto.request.*;
import com.study.SpringSecurityMybatis.entity.OAuth2User;
import com.study.SpringSecurityMybatis.entity.User;
import com.study.SpringSecurityMybatis.exception.SignupException;
import com.study.SpringSecurityMybatis.repository.OAuth2UserMapper;
import com.study.SpringSecurityMybatis.service.OAusth2Servise;
import com.study.SpringSecurityMybatis.service.TokenService;
import com.study.SpringSecurityMybatis.service.UserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import javax.validation.Valid;

@Slf4j
@RestController
public class AuthenticationController {

    @Autowired
    private UserService userService;

    @Autowired
    private OAusth2Servise oAusth2Servise;

    @Autowired
    private OAuth2UserMapper oAuth2UserMapper;

    @Autowired
    private TokenService tokenService;

    @ValidAop
    @PostMapping("/auth/signup")
    public ResponseEntity<?> signup(@Valid @RequestBody ReqSignupDto dto, BindingResult bindingResult) throws SignupException {
        return ResponseEntity.ok().body(userService.insertUserAndUserRoles(dto));
    }

    @ValidAop
    @PostMapping("/auth/signin")
    public ResponseEntity<?> signin(@Valid @RequestBody ReqSigninDto dto,BindingResult bindingResult) {
        return ResponseEntity.ok().body(userService.getGeneratedToken(dto));
    }

    @ValidAop
    @PostMapping("/auth/oauth2/merge")
    public ResponseEntity<?> oAuth2Merge(@Valid @RequestBody ReqOAuth2MergeDto dto, BindingResult bindingResult) {
        OAuth2User oAuth2User = userService.mergeSignin(dto);
        oAusth2Servise.merge(oAuth2User);
        return ResponseEntity.ok().body(true);
    }

    @ValidAop
    @PostMapping("/auth/oauth2/signup")
    public ResponseEntity<?> oAuth2Signup(@Valid @RequestBody ReqOAuth2SignupDto dto, BindingResult bindingResult ) {
        log.info("{}", dto);
        oAusth2Servise.signup(dto);
        return ResponseEntity.ok().body(true);
    }

    @GetMapping("/auth/access")
    public ResponseEntity<?> access(ReqAccessDto dto) {
        return ResponseEntity.ok().body(tokenService.isValidAccessToken(dto.getAccessToken()));
    }

}










