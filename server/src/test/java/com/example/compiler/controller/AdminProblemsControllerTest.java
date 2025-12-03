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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = AdminProblemsController.class)
@Import(com.example.compiler.config.WebConfig.class)
@TestPropertySource(properties = {
        "spring.flyway.enabled=false",
        "storage.type=memory",
        "admin.token=secret"
})
class AdminProblemsControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ProblemRepository problemRepository;

    @Test
    void createProblem_withToken_callsRepository() throws Exception {
        String json = "{" +
                "\"id\":\"p1\"," +
                "\"title\":\"Title\"," +
                "\"statement\":\"Stmt\"," +
                "\"inputSpec\":\"in\"," +
                "\"outputSpec\":\"out\"," +
                "\"constraints\":\"c\"" +
                "}";

        mockMvc.perform(post("/api/admin/problems")
                        .contentType("application/json")
                        .header("X-Admin-Token", "secret")
                        .content(json))
                .andExpect(status().isOk());

        verify(problemRepository).saveProblem(any());
    }

    @Test
    void createProblem_withoutToken_unauthorized() throws Exception {
        String json = "{}";

        mockMvc.perform(post("/api/admin/problems")
                        .contentType("application/json")
                        .content(json))
                .andExpect(status().isUnauthorized());

        verify(problemRepository, never()).saveProblem(any());
    }

    @Test
    void updateProblem_withToken_callsRepository() throws Exception {
        String json = "{" +
                "\"id\":\"p1\"," +
                "\"title\":\"Title\"," +
                "\"statement\":\"Stmt\"," +
                "\"inputSpec\":\"in\"," +
                "\"outputSpec\":\"out\"," +
                "\"constraints\":\"c\"" +
                "}";

        mockMvc.perform(put("/api/admin/problems/p1")
                        .contentType("application/json")
                        .header("X-Admin-Token", "secret")
                        .content(json))
                .andExpect(status().isOk());

        verify(problemRepository).saveProblem(any());
    }

    @Test
    void deleteProblem_withToken_callsRepository() throws Exception {
        mockMvc.perform(delete("/api/admin/problems/p1")
                        .header("X-Admin-Token", "secret"))
                .andExpect(status().isOk());

        verify(problemRepository).deleteProblem("p1");
    }
}