package com.study.SpringSecurityMybatis.security.principal;

import com.study.SpringSecurityMybatis.entity.UserRoles;
import lombok.Builder;
import lombok.Data;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Builder
@Data
public class PrincipalUser implements UserDetails {

    private Long id;
    private String Username;
    private String password;
    private Set <UserRoles> roles;

//    @Override
//    public Collection<? extends GrantedAuthority> getAuthorities() {
//        return List.of();
//    }
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return roles.stream().map(
                ur -> new SimpleGrantedAuthority(ur.getRole().getName())
        ).collect(Collectors.toSet());
    }

    @Override
    public boolean isAccountNonExpired() {
        return false;
    }

    @Override
    public boolean isAccountNonLocked() {
        return false;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return false;
    }

    @Override
    public boolean isEnabled() {
        return false;
    }
}
