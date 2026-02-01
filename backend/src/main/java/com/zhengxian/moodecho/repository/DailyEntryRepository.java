package com.zhengxian.moodecho.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.zhengxian.moodecho.entity.DailyEntry;
import com.zhengxian.moodecho.entity.User;

@Repository
public interface DailyEntryRepository extends JpaRepository<DailyEntry, Long> {
    // check entries by user for data isolation
    List<DailyEntry> findByUser(User user);
}