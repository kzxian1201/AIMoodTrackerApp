package com.zhengxian.moodecho.controller;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.zhengxian.moodecho.entity.DailyEntry;
import com.zhengxian.moodecho.entity.HabitLog;
import com.zhengxian.moodecho.repository.DailyEntryRepository;
import com.zhengxian.moodecho.service.AiService;

@RestController
@RequestMapping("/api/entries")
@CrossOrigin(origins = "*") 
public class JournalController {

    private final DailyEntryRepository repository;
    private final AiService aiService;

    public JournalController(DailyEntryRepository repository, AiService aiService) {
        this.repository = repository;
        this.aiService = aiService;
    }

    // 1. Input & Consolidate
    @PostMapping
    public DailyEntry createEntry(@RequestBody Map<String, Object> payload) {
        String journalText = (String) payload.get("journal");

        // A. Process
        Map<String, Object> aiResult;
        try {
            aiResult = aiService.analyzeJournal(journalText);
        } catch (Exception e) {
            System.err.println("AI analysis failed: " + e.getMessage());
            aiResult = Map.of(
                "mood_score", 5, 
                "summary", "AI is taking a nap (Connection Error), but entry saved."
            );
        }

        // B. Consolidate
        DailyEntry entry = new DailyEntry();
        entry.setEntryDate(LocalDate.now()); 
        entry.setJournalContent(journalText);
        
        // Handle Mood Score
        Object moodObj = aiResult.get("mood_score");
        if (moodObj instanceof Integer moodInt) {
             entry.setMoodScore(moodInt);
        } else if (moodObj != null) {
             try {
                String numStr = String.valueOf(moodObj);
                entry.setMoodScore(Integer.valueOf(numStr));
             } catch (NumberFormatException e) {
                entry.setMoodScore(5);
             }
        }
        entry.setAiSummary((String) aiResult.get("summary"));

        // handle Habits
        if (payload.containsKey("habits")) {
            Object habitsObj = payload.get("habits");
            
            if (habitsObj instanceof List<?> list) {
                List<HabitLog> logs = new ArrayList<>();
                for (Object item : list) {
                    HabitLog log = new HabitLog();
                    log.setHabitName(item.toString());
                    log.setCompleted(true);
                    log.setDailyEntry(entry);
                    logs.add(log);
                }
                entry.setHabitLogs(logs);
            }
        }

        // C. Save
        return repository.save(entry);
    }

    // 2. View 
    @GetMapping
    public List<DailyEntry> getAllEntries() {
        return repository.findAll();
    }
}