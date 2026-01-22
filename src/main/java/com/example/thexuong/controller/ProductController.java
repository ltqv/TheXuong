package com.example.thexuong.controller;

import com.example.thexuong.entity.Product;
import com.example.thexuong.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {
    private final ProductRepository productRepository;

    //1. api ds sp trang chu
    // GET: http://localhost:8080/api/products
    @GetMapping
    public ResponseEntity<Page<Product>> getAllProducts(
            @RequestParam(defaultValue = "0") int page, // Trang hiện tại (mặc định trang 0)
            @RequestParam(defaultValue = "12") int size // Số lượng 1 sp/trang (mặc định 12)
    ) {
        // Lấy sản phẩm, sắp xếp theo ID giảm dần (mới nhất lên đầu)
        return ResponseEntity.ok((Page<Product>) productRepository.findAll(
                PageRequest.of(page, size, Sort.by("id").descending())
        ));
    }
    //2. chi tiet' sp
    // GET: http://localhost:8080/api/products/1
    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        return productRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    //3. api  them sp
    // POST: http://localhost:8080/api/products
    @PostMapping
    public ResponseEntity<Product> createProduct(@RequestBody Product product) {
        return ResponseEntity.ok(productRepository.save(product));
    }
}
