package io.sderp.ws.repository.mapper;

import io.sderp.ws.model.UserActionHistories;
import org.springframework.stereotype.Repository;


@Repository
public interface UserActionHistoryMapper {
    void insertActionHistory(UserActionHistories userActionHistories);
}
