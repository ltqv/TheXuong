package com.example.thexuong.security;

import com.example.thexuong.entity.User;
import com.example.thexuong.repository.UserRepository;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Collections;

@Component
@RequiredArgsConstructor
//Xử lý sau khi login Google xong
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {
    private final JwtService jwtService;
    private final UserRepository userRepository;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");

        //lưu user nếu chưa có (Login đơn giản)
        User user = userRepository.findByEmail(email).orElseGet(() -> {
            return userRepository.save(User.builder()
                    .email(email)
                    .username(email)
                    .password("") // Google user không có pass
                    .role("USER")
                    .provider("GOOGLE")
                    .build());
        });

        //Vì JwtService yêu cầu UserDetails, ta phải tạo thủ công object này
        UserDetails userDetails = new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword() == null ? "" : user.getPassword(),
                Collections.singleton(new SimpleGrantedAuthority(user.getRole()))
        );
        // tạo token
        String token = jwtService.generateToken(userDetails);
        //HttpOnly Cookie
        Cookie cookie = new Cookie("accessToken", token);
        cookie.setHttpOnly(true);
        cookie.setSecure(false);
        cookie.setPath("/");
        cookie.setMaxAge(60 * 60); //1giờ
        //gắn cookie vào response
        response.addCookie(cookie);
        // Redirect về home kèm token
        getRedirectStrategy().sendRedirect(request, response, "/index.html");
    }
}
