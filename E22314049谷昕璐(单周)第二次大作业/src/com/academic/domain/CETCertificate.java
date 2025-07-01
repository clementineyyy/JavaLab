package com.academic.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDate;
import java.util.UUID;

@JsonIgnoreProperties(ignoreUnknown = true)
public class CETCertificate implements Certificate {
    private static final long serialVersionUID = 1L;

    //证书的id
    private final UUID id;
    private final UUID studentId;
    private final String name;
    private final int level; // 4 or 6 for CET-4 or CET-6
    private final int score;
    private final LocalDate issueDate;
    private final String issuingAuthority;
    private final LocalDate expirationDate;

    public CETCertificate(UUID id, UUID studentId, String name, int level, int score,
                         LocalDate issueDate, String issuingAuthority,
                         LocalDate expirationDate) {
        this.id = id == null ? UUID.randomUUID() : id;
        this.studentId = studentId;
        this.name = name;
        this.level = level;
        this.score = score;
        this.issueDate = issueDate;
        this.issuingAuthority = issuingAuthority;
        this.expirationDate = expirationDate;
    }

    @Override
    public UUID getId() { return id; }

    public UUID getStudentId() { return studentId; }

    @Override
    public String getName() { return name; }

    @Override
    public LocalDate getIssueDate() { return issueDate; }

    @Override
    public String getIssuingAuthority() { return issuingAuthority; }

    @Override
    public boolean isValid() {
        return LocalDate.now().isBefore(expirationDate);
    }

    public int getLevel() { return level; }
}