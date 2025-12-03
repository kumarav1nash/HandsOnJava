package com.example.compiler.dto;

import java.util.Arrays;
import java.util.List;

public class BulkOperationResultDTO {
    private boolean success;
    private int processedCount;
    private int successCount;
    private int failedCount;
    private List<String> errors;
    private List<String> processedIds;

    public BulkOperationResultDTO() {}

    public BulkOperationResultDTO(boolean success, int processedCount, int successCount, 
                                 int failedCount, List<String> errors, List<String> processedIds) {
        this.success = success;
        this.processedCount = processedCount;
        this.successCount = successCount;
        this.failedCount = failedCount;
        this.errors = errors;
        this.processedIds = processedIds;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public int getProcessedCount() {
        return processedCount;
    }

    public void setProcessedCount(int processedCount) {
        this.processedCount = processedCount;
    }

    public int getSuccessCount() {
        return successCount;
    }

    public void setSuccessCount(int successCount) {
        this.successCount = successCount;
    }

    public int getFailedCount() {
        return failedCount;
    }

    public void setFailedCount(int failedCount) {
        this.failedCount = failedCount;
    }

    public List<String> getErrors() {
        return errors;
    }

    public void setErrors(List<String> errors) {
        this.errors = errors;
    }

    public List<String> getProcessedIds() {
        return processedIds;
    }

    public void setProcessedIds(List<String> processedIds) {
        this.processedIds = processedIds;
    }

    public static BulkOperationResultDTO success(List<String> processedIds) {
        return new BulkOperationResultDTO(true, processedIds.size(), processedIds.size(), 0, null, processedIds);
    }

    public static BulkOperationResultDTO failure(String error) {
        return new BulkOperationResultDTO(false, 0, 0, 1, Arrays.asList(error), null);
    }
}