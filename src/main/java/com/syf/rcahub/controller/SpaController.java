package com.syf.rcahub.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaController {

    @GetMapping({"/", "/dashboard", "/rcas", "/rcas/new", "/rcas/{id}", "/rcas/{id}/edit"})
    public String forwardToFrontend() {
        return "forward:/index.html";
    }

    @GetMapping("/favicon.ico")
    public String forwardFavicon() {
        return "forward:/favicon.svg";
    }
}
