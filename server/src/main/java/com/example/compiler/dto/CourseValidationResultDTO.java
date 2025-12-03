package com.example.compiler.dto;

import java.util.List;

public class CourseValidationResultDTO {
    private boolean valid;
    private List<String> errors;
    private List<String> warnings;
    private int totalSections;
    private int conceptSections;
    private int codeSections;
    private int mcqSections;
    private int practiceSections;

    public CourseValidationResultDTO() {}

    public CourseValidationResultDTO(boolean valid, List<String> errors, List<String> warnings,
                                   int totalSections, int conceptSections, int codeSections, 
                                   int mcqSections, int practiceSections) {
        this.valid = valid;
        this.errors = errors;
        this.warnings = warnings;
        this.totalSections = totalSections;
        this.conceptSections = conceptSections;
        this.codeSections = codeSections;
        this.mcqSections = mcqSections;
        this.practiceSections = practiceSections;
    }

    public boolean isValid() {
        return valid;
    }

    public void setValid(boolean valid) {
        this.valid = valid;
    }

    public List<String> getErrors() {
        return errors;
    }

    public void setErrors(List<String> errors) {
        this.errors = errors;
    }

    public List<String> getWarnings() {
        return warnings;
    }

    public void setWarnings(List<String> warnings) {
        this.warnings = warnings;
    }

    public int getTotalSections() {
        return totalSections;
    }

    public void setTotalSections(int totalSections) {
        this.totalSections = totalSections;
    }

    public int getConceptSections() {
        return conceptSections;
    }

    public void setConceptSections(int conceptSections) {
        this.conceptSections = conceptSections;
    }

    public int getCodeSections() {
        return codeSections;
    }

    public void setCodeSections(int codeSections) {
        this.codeSections = codeSections;
    }

    public int getMcqSections() {
        return mcqSections;
    }

    public void setMcqSections(int mcqSections) {
        this.mcqSections = mcqSections;
    }

    public int getPracticeSections() {
        return practiceSections;
    }

    public void setPracticeSections(int practiceSections) {
        this.practiceSections = practiceSections;
    }

    public static CourseValidationResultDTO valid(int totalSections, int conceptSections, 
                                                int codeSections, int mcqSections, int practiceSections) {
        return new CourseValidationResultDTO(true, null, null, totalSections, 
                                           conceptSections, codeSections, mcqSections, practiceSections);
    }

    public static CourseValidationResultDTO invalid(List<String> errors, List<String> warnings) {
        return new CourseValidationResultDTO(false, errors, warnings, 0, 0, 0, 0, 0);
    }
}