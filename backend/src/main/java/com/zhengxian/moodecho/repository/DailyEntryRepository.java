package com.zhengxian.moodecho.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.zhengxian.moodecho.entity.DailyEntry;

public interface DailyEntryRepository extends JpaRepository<DailyEntry, UUID> {
}