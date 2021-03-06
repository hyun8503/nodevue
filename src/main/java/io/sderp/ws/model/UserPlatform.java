package io.sderp.ws.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserPlatform {
    private String userId;
    private String platformId;
    private LocalDateTime createdDate;
    private LocalDateTime modifiedDate;
}