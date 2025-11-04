package com.example.compiler.service;

import com.example.compiler.model.ProblemStatus;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class WorkflowServiceTest {
    @Test
    void transitionsAndAuditWork() {
        WorkflowService wf = new WorkflowService();
        String pid = "wf-problem";

        assertEquals(ProblemStatus.DRAFT, wf.getStatus(pid));
        assertTrue(wf.getAudit(pid).isEmpty());

        assertEquals(ProblemStatus.IN_REVIEW, wf.submitForReview(pid, "author", "ready for review"));
        assertEquals(ProblemStatus.IN_REVIEW, wf.getStatus(pid));
        assertEquals(1, wf.getAudit(pid).size());

        assertEquals(ProblemStatus.CHANGES_REQUESTED, wf.requestChanges(pid, "moderator", "needs fixes"));
        assertEquals(ProblemStatus.CHANGES_REQUESTED, wf.getStatus(pid));
        assertEquals(2, wf.getAudit(pid).size());

        assertEquals(ProblemStatus.IN_REVIEW, wf.submitForReview(pid, "author", "fixed"));
        assertEquals(3, wf.getAudit(pid).size());

        assertEquals(ProblemStatus.PUBLISHED, wf.publish(pid, "admin", "looks good"));
        assertEquals(ProblemStatus.PUBLISHED, wf.getStatus(pid));
        assertEquals(4, wf.getAudit(pid).size());

        assertEquals(ProblemStatus.DRAFT, wf.revertToDraft(pid, "admin", "unpublish"));
        assertEquals(ProblemStatus.DRAFT, wf.getStatus(pid));
        assertEquals(5, wf.getAudit(pid).size());
    }

    @Test
    void invalidTransitionsThrow() {
        WorkflowService wf = new WorkflowService();
        String pid = "wf-invalid";
        assertThrows(IllegalStateException.class, () -> wf.publish(pid, "admin", null));
        assertThrows(IllegalStateException.class, () -> wf.requestChanges(pid, "mod", null));
        assertThrows(IllegalStateException.class, () -> wf.revertToDraft(pid, "admin", null));
    }
}