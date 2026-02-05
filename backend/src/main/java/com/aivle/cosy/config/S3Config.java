package com.aivle.cosy.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;

@Configuration
public class S3Config {

    @Bean
    public S3Client s3Client(@Value("${cloud.aws.region}") String region) {
        return S3Client.builder()
                .region(Region.of(region))
                // credentials는 DefaultCredentialsProvider가 기본 적용됨
                // (환경변수, ~/.aws/credentials, EC2 Role 등 자동 인식)
                .build();
    }
}