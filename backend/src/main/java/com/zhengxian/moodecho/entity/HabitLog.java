package com.zhengxian.moodecho.entity;

import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "habit_logs")
public class HabitLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "habit_name", nullable = false)
    private String habitName;

    @Column(name = "completed")
    private Boolean completed = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "entry_id")
    @JsonIgnore
    private DailyEntry dailyEntry;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getHabitName() { return habitName; }
    public void setHabitName(String habitName) { this.habitName = habitName; }

    public Boolean getCompleted() { return completed; }
    public void setCompleted(Boolean completed) { this.completed = completed; }

    public DailyEntry getDailyEntry() { return dailyEntry; }
    public void setDailyEntry(DailyEntry dailyEntry) { this.dailyEntry = dailyEntry; }
}