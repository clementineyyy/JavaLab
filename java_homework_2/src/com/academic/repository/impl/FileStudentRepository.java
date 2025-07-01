package com.academic.repository.impl;

import com.academic.domain.Student;
import com.academic.repository.StudentRepository;
import com.academic.util.FileUtils;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.*;

public class FileStudentRepository implements StudentRepository {
    private final String dataDirectory;
    private final Map<UUID, Student> cache = new HashMap<>();
    private boolean cacheLoaded = false;

    public FileStudentRepository(String dataDirectory) {
        this.dataDirectory = dataDirectory;
        createDirectoryIfNotExists();
    }

    private void createDirectoryIfNotExists() {
        try {
            Files.createDirectories(Paths.get(dataDirectory));
        } catch (IOException e) {
            throw new RuntimeException("Failed to create data directory: " + dataDirectory, e);
        }
    }

    private void loadCache() {
        if (cacheLoaded) return;

        File dir = new File(dataDirectory);
        File[] files = dir.listFiles((d, name) -> name.endsWith(".dat"));

        if (files != null) {
            for (File file : files) {
                try {
                    Student student = FileUtils.deserialize(file.getPath(), Student.class);
                    cache.put(student.getId(), student);
                } catch (Exception e) {
                    System.err.println("Failed to load student from " + file.getName() + ": " + e.getMessage());
                }
            }
        }

        cacheLoaded = true;
    }

    @Override
    public Optional<Student> findById(UUID id) {
        loadCache();
        return Optional.ofNullable(cache.get(id));
    }

}
