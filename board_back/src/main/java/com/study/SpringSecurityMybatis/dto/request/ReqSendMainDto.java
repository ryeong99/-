package com.study.SpringSecurityMybatis.dto.request;

import lombok.Data;

@Data
public class ReqSendMainDto {
    private String toEmail;
    private String subject;
    private String content;
}
