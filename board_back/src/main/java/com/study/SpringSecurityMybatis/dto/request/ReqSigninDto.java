package com.study.SpringSecurityMybatis.dto.request;

import lombok.Data;

import javax.validation.constraints.NotBlank;

@Data
public class ReqSigninDto {
    @NotBlank(message = "사용자 정보를 입력해주세요.")
    private String username;
    @NotBlank(message = "비밀번호를 입력해주세요.")
    private String password;

}
