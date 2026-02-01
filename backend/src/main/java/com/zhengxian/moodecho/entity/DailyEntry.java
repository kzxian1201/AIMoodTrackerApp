package com.zhengxian.moodecho.entity;

import java.time.LocalDate;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "daily_entries")
@Data
public class DailyEntry {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate entryDate;

    @Column(columnDefinition = "TEXT")
    private String journalContent;

    private int moodScore;

    @Column(columnDefinition = "TEXT")
    private String aiSummary;

    @OneToMany(mappedBy = "dailyEntry", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<HabitLog> habitLogs;

    // connection to User entity for data isolation
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @JsonIgnore // no need to serialize user info with daily entry
    private User user;
}