package com.academic.repository;

import com.academic.domain.CETCertificate;
import java.util.List;
import java.util.UUID;

public interface CETCertificateRepository {
    CETCertificate save(CETCertificate certificate);
    CETCertificate findById(UUID id);
    List<CETCertificate> findByStudentId(UUID studentId);
    //查询4级or6级证书
    List<CETCertificate> findByLevel(int level);
    boolean delete(UUID id);
}
