package io.sderp.ws.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.sderp.ws.controller.param.ModifyUserParam;
import io.sderp.ws.controller.param.SignUpParam;
import io.sderp.ws.controller.param.UserParam;
import io.sderp.ws.exception.BaseException;
import io.sderp.ws.exception.ErrorCode;
import io.sderp.ws.exception.NotAcceptableIdException;
import io.sderp.ws.model.*;
import io.sderp.ws.model.support.UserActionHistoryStatus;
import io.sderp.ws.model.support.UserActionHistoryType;
import io.sderp.ws.model.support.UserStatusType;
import io.sderp.ws.model.support.UserType;
import io.sderp.ws.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.annotation.PostConstruct;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class UserService {
    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    private static final String DEFAULT_ADMIN_ID = "admin";
    private static final String DEFAULT_ADMIN_PASSWORD = "1234";
    private static final String DEFAULT_ADMIN_NAME = "administrator";
    private static final Map<String, Boolean> notAcceptableIdMap = new HashMap<>();

    static {
        notAcceptableIdMap.put("check", false);
        notAcceptableIdMap.put("signin", false);
        notAcceptableIdMap.put("signout", false);
        notAcceptableIdMap.put("signcheck", false);
        notAcceptableIdMap.put("login", false);
        notAcceptableIdMap.put("logout", false);
        notAcceptableIdMap.put("logincheck", false);
    }

    private PasswordEncoder passwordEncoder;
    private UserRepository repository;
    private UserRoleRepository userRoleRepository;
    private UserPlatformRepository userPlatformRepository;
    private RoleRepository roleRepository;
    private UserActionHistoryRepository userActionHistoryRepository;

    @Autowired
    public UserService(UserRepository repository, PasswordEncoder passwordEncoder, UserRoleRepository userRoleRepository, UserPlatformRepository userPlatformRepository, RoleRepository roleRepository, UserActionHistoryRepository userActionHistoryRepository) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
        this.userRoleRepository = userRoleRepository;
        this.userPlatformRepository = userPlatformRepository;
        this.roleRepository = roleRepository;
        this.userActionHistoryRepository = userActionHistoryRepository;
    }

    @PostConstruct
    public void checkAdmin() {
        final List<User> users = getUsers(UserType.ADMIN);

        if ((users == null) || (users.size() < 1)) {
            logger.info("Admin account not exists : create a default admin account");

            final User newAdmin = User.builder()
                    .userId(UUID.randomUUID().toString())
                    .loginId(DEFAULT_ADMIN_ID)
                    .loginPassword(DEFAULT_ADMIN_PASSWORD)
                    .typeCode(UserType.ADMIN)
                    .statusCode(UserStatusType.NORMAL)
                    .build();

            createNewUser(newAdmin);
        }
    }

    public User getUser(String id) {
        return repository.selectUser(id);
    }

    public List<User> selectAllUser() {
        return repository.selectAllUser();
    }

    public UserParam getUserParam(String userId) {
        User user = repository.selectUserByUserId(userId);
        Role role = roleRepository.selectRoleByUserId(userId);
        List<Platform> platformList = userPlatformRepository.selectPlatformByUserId(userId);

        if (user.getUserId() == null && role.getRoleId() == null && platformList.size() == 0) {
            throw new RuntimeException("get user param fail");
        }

        return UserParam.builder()
                .user(user)
                .role(role)
                .platform(platformList)
                .build();
    }

    public List<User> getUsers(UserType type) {
        return repository.selectUsers(type);
    }

    @Transactional(rollbackFor = Exception.class)
    public User signUp(SignUpParam signUpParam, String remoteAddr) throws JsonProcessingException {
        ObjectMapper objectMapper = new ObjectMapper();
        loginIdDuplicateCheck(signUpParam.getUserId());
        List<String> platformIdList = signUpParam.getUserPlatformIdList();
        final String userId = UUID.randomUUID().toString();
        final User newUser = User.builder()
                .userId(userId)
                .loginId(signUpParam.getUserId())
                .loginPassword(signUpParam.getUserPwd())
                .statusCode(UserStatusType.NORMAL)
                .typeCode(UserType.NORMAL)
                .build();

        final UserRole userRole = UserRole.builder()
                .userId(userId)
                .roleId(signUpParam.getUserRoleId())
                .createdDate(LocalDateTime.now())
                .build();

        createNewUser(newUser);
        userRoleRepository.insertUserRole(userRole);

        for (String platformId : platformIdList) {
            userPlatformRepository.insertUserPlatform(UserPlatform.builder()
                    .userId(userId)
                    .platformId(platformId)
                    .createdDate(LocalDateTime.now())
                    .modifiedDate(LocalDateTime.now())
                    .build());
        }

        userActionHistoryRepository.insertActionHistory(UserActionHistories.builder()
                .userId(userId)
                .typeCode(UserActionHistoryType.USER)
                .statusCode(UserActionHistoryStatus.CREATE)
                .ipAddress(remoteAddr)
                .description(objectMapper.writeValueAsString(signUpParam))
                .build());

        return newUser;
    }

    public User createNewUser(User user) {
        if (isNotAcceptableId(user.getUserId())) {
            throw new NotAcceptableIdException(user.getUserId());
        }
        final String encodedPassword = passwordEncoder.encode(user.getLoginPassword());

        user.setLoginPassword(encodedPassword);
        user.setCreatedDate(LocalDateTime.now());
        user.setModifiedDate(LocalDateTime.now());

        repository.insertUser(user);

        return user;
    }

    @Transactional(rollbackFor = Exception.class)
    public void modifyUser(ModifyUserParam modifyUserParam, String remoteAddr) throws JsonProcessingException {
        ObjectMapper objectMapper = new ObjectMapper();
        String loginPassword = null;
        List<String> platformIdList = modifyUserParam.getUserPlatformIdList();
        if (platformIdList.size() == 0) {
            throw new RuntimeException("modify user fail: platform id list size not zero");
        }

        if (!modifyUserParam.getUserPwd().isEmpty()) {
            loginPassword = passwordEncoder.encode(modifyUserParam.getUserPwd());
        }

        User user = User.builder()
                .userId(modifyUserParam.getUserId())
                .loginPassword(loginPassword)
                .typeCode(UserType.NORMAL)
                .statusCode(UserStatusType.NORMAL)
                .modifiedDate(LocalDateTime.now())
                .build();

        repository.updateUser(user);
        userRoleRepository.updateUserRole(modifyUserParam.getUserId(), modifyUserParam.getUserRoleId());
        userPlatformRepository.deleteUserPlatform(modifyUserParam.getUserId());
        for (String platformId : platformIdList) {
            userPlatformRepository.insertUserPlatform(UserPlatform.builder()
                    .userId(modifyUserParam.getUserId())
                    .platformId(platformId)
                    .modifiedDate(LocalDateTime.now())
                    .createdDate(LocalDateTime.now())
                    .build());
        }

        userActionHistoryRepository.insertActionHistory(UserActionHistories.builder()
                .description(objectMapper.writeValueAsString(modifyUserParam))
                .ipAddress(remoteAddr)
                .statusCode(UserActionHistoryStatus.UPDATE)
                .typeCode(UserActionHistoryType.USER)
                .userId(modifyUserParam.getUserId())
                .build());
    }

    @Transactional(rollbackFor = Exception.class)
    public void withdrawUser(String userId, String remoteAddr) throws JsonProcessingException {
        ObjectMapper objectMapper = new ObjectMapper();
        Map<String, String> param = new HashMap<>();
        param.put("userId", userId);

        repository.updateUser(User.builder()
                .userId(userId)
                .loginPassword(null)
                .statusCode(UserStatusType.WITHDRAW)
                .typeCode(UserType.NORMAL)
                .modifiedDate(LocalDateTime.now())
                .build());

        userRoleRepository.deleteUserRole(userId);
        userPlatformRepository.deleteUserPlatform(userId);

        userActionHistoryRepository.insertActionHistory(UserActionHistories.builder()
                .description(objectMapper.writeValueAsString(param))
                .ipAddress(remoteAddr)
                .statusCode(UserActionHistoryStatus.MAPPING)
                .typeCode(UserActionHistoryType.USER)
                .userId(userId)
                .build());
    }

    private void loginIdDuplicateCheck(String loginId) {
        long count = repository.selectUserCount(loginId);
        if (count != 0) {
            throw new BaseException(ErrorCode.LOGIN_ID_IN_USE, HttpStatus.BAD_REQUEST, "login id in use");
        }
    }

    private boolean isNotAcceptableId(String id) {
        boolean isNotAcceptable = false;

        if ((id == null) || (id.length() < 1) || (id.contains(" ")) || (notAcceptableIdMap.containsKey(id.toLowerCase()))) {
            isNotAcceptable = true;
        }

        return isNotAcceptable;
    }

    @Transactional(rollbackFor = Exception.class)
    public int updateMyInfo(String password, String userId, String remoteAddr, String paramJson) {
        String loginPassword = null;
        if (!password.isEmpty()) {
            loginPassword = passwordEncoder.encode(password);

        }
        User user = User.builder()
                .userId(userId)
                .loginPassword(loginPassword)
                .build();


        UserActionHistories userActionHistories = UserActionHistories.builder()
                .userId(userId)
                .typeCode(UserActionHistoryType.USER)
                .statusCode(UserActionHistoryStatus.UPDATE)
                .description(paramJson)
                .ipAddress(remoteAddr)
                .build();

        userActionHistoryRepository.insertActionHistory(userActionHistories);

        return repository.updatePassword(user);

    }


    public List<User> searchUserList(String platform, String role, String name) {
        return repository.searchUserList(platform, role, name);
    }
}

