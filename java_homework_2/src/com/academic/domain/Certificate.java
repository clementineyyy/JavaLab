package com.academic.domain;

import java.io.Serializable;
import java.time.LocalDate;
import java.util.UUID;

public interface Certificate extends Serializable {
    UUID getId();
    String getName();
    LocalDate getIssueDate();
    String getIssuingAuthority();
    boolean isValid();
}