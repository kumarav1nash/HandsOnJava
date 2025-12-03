package com.example.compiler.controller;

import com.example.compiler.repo.ProblemRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = AdminTestCasesController.class)
@Import(com.example.compiler.config.WebConfig.class)
@TestPropertySource(properties = {
        "spring.flyway.enabled=false",
        "storage.type=memory",
        "admin.token=secret"
})
class AdminTestCasesControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ProblemRepository problemRepository;

    @Test
    void addTestCase_withToken_callsRepository() throws Exception {
        String json = "{" +
                "\"input\":\"1 2\"," +
                "\"expectedOutput\":\"3\"," +
                "\"sample\":true" +
                "}";

        mockMvc.perform(post("/api/admin/problems/p1/testcases")
                        .contentType("application/json")
                        .header("X-Admin-Token", "secret")
                        .content(json))
                .andExpect(status().isOk());

        verify(problemRepository).saveTestCase(any(String.class), any(), any(Boolean.class));
    }

    @Test
    void addTestCase_withoutToken_unauthorized() throws Exception {
        String json = "{}";

        mockMvc.perform(post("/api/admin/problems/p1/testcases")
                        .contentType("application/json")
                        .content(json))
                .andExpect(status().isUnauthorized());

        verify(problemRepository, never()).saveTestCase(any(String.class), any(), any(Boolean.class));
    }

    @Test
    void deleteAllTestCases_withToken_callsRepository() throws Exception {
        mockMvc.perform(delete("/api/admin/problems/p1/testcases")
                        .header("X-Admin-Token", "secret"))
                .andExpect(status().isOk());

        verify(problemRepository).deleteTestCasesByProblemId("p1");
    }
}