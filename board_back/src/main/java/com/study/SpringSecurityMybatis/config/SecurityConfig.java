package com.study.SpringSecurityMybatis.config;

import com.study.SpringSecurityMybatis.security.filter.JwtAccessTokenFilter;
import com.study.SpringSecurityMybatis.security.handler.AuthenticationHandler;
import com.study.SpringSecurityMybatis.security.handler.OAuth2SuccessHandler;
import com.study.SpringSecurityMybatis.service.OAusth2Servise;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@EnableWebSecurity
@Configuration
public class SecurityConfig extends WebSecurityConfigurerAdapter {

    @Autowired
    private JwtAccessTokenFilter jwtAccessTokenFilter;

    @Autowired
    private AuthenticationHandler authenticationHandler;

    @Autowired
    private OAuth2SuccessHandler oAuth2SuccessHandler;

    @Autowired
    private OAusth2Servise oAusth2Servise;

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http.formLogin().disable();
        http.httpBasic().disable();
        http.csrf().disable();
        http.headers().frameOptions().disable();
        http.sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS);
        http.cors();
        http.oauth2Login().successHandler(oAuth2SuccessHandler).userInfoEndpoint().userService(oAusth2Servise);
        http.exceptionHandling().authenticationEntryPoint(authenticationHandler);
        http.authorizeRequests()
                .antMatchers("/auth/**", "/h2-console/**")
                .permitAll()
                .antMatchers(HttpMethod.GET, "/board/**")
                .permitAll()
                .anyRequest()
                .authenticated();

        http.addFilterBefore(jwtAccessTokenFilter, UsernamePasswordAuthenticationFilter.class);
    }
}