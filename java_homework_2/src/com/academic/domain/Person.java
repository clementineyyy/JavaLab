package com.academic.domain;

import java.io.Serializable;
import java.time.LocalDate;
import java.util.UUID;

public abstract class Person implements Serializable {
    private static final long serialVersionUID = 1L;

    //每个人不同的id
    protected final UUID id;
    protected String name;
    protected LocalDate birthDate;
    protected String contactInfo;

    protected Person(UUID id, String name, LocalDate birthDate, String contactInfo) {
        this.id = id == null ? UUID.randomUUID() : id;
        this.name = name;
        this.birthDate = birthDate;
        this.contactInfo = contactInfo;
    }

    //实现多态
    public abstract String getRole();

    public UUID getId() { return id; }
    public String getName() { return name; }
}
