package com.aivle.cosy.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class S3Service {

    private final S3Client s3Client;

    @Value("${cloud.aws.s3.bucket}")
    private String bucket;

    /**
     * file을 S3에 업로드하고 public URL을 반환
     * 저장 key: {prefix}/{UUID}-{originalFilename}
     */
    public String uploadFile(MultipartFile file, String prefix) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("업로드할 파일이 비어있습니다.");
        }

        String original = file.getOriginalFilename();
        String safeOriginal = (original == null) ? "file" : original.replaceAll("\\s+", "_");

        String key = UUID.randomUUID() + "-" + safeOriginal;

        if (prefix != null && !prefix.isBlank()) {
            String normalized = prefix.startsWith("/") ? prefix.substring(1) : prefix;
            normalized = normalized.endsWith("/") ? normalized.substring(0, normalized.length() - 1) : normalized;
            key = normalized + "/" + key;
        }

        try {
            PutObjectRequest putReq = PutObjectRequest.builder()
                    .bucket(bucket)
                    .key(key)
                    .contentType(file.getContentType())
                    .contentLength(file.getSize())
                    .build();

            s3Client.putObject(putReq, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
        } catch (IOException e) {
            throw new RuntimeException("파일 업로드 실패", e);
        }

        return "https://" + bucket + ".s3.amazonaws.com/" + key;
    }

    // key로 삭제
    public void deleteFileByKey(String key) {
        if (key == null || key.isBlank()) return;

        DeleteObjectRequest delReq = DeleteObjectRequest.builder()
                .bucket(bucket)
                .key(key)
                .build();

        s3Client.deleteObject(delReq);
    }

    // URL로 삭제 (DB에 URL 저장하는 경우 편의 메서드)
    public void deleteFileByUrl(String fileUrl) {
        String key = extractKeyFromUrl(fileUrl);
        deleteFileByKey(key);
    }

    private String extractKeyFromUrl(String fileUrl) {
        if (fileUrl == null || fileUrl.isBlank()) return null;

        try {
            URI uri = URI.create(fileUrl);
            String path = uri.getPath(); // "/products/12/uuid.png"
            if (path == null || path.isBlank()) return null;

            String key = path.startsWith("/") ? path.substring(1) : path;

            // URL 인코딩된 한글/공백 처리
            return URLDecoder.decode(key, StandardCharsets.UTF_8);
        } catch (Exception e) {
            // URL이 아니라 key가 들어온 경우를 대비
            return fileUrl;
        }
    }
}