package com.academic.repository;

import java.util.Optional;
import java.util.UUID;

public interface Repository<T> {
    Optional<T> findById(UUID id);
}
