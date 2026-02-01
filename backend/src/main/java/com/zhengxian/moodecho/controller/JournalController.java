package com.zhengxian.moodecho.controller;

import java.security.Principal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.zhengxian.moodecho.entity.DailyEntry;
import com.zhengxian.moodecho.entity.HabitLog;
import com.zhengxian.moodecho.entity.User;
import com.zhengxian.moodecho.repository.DailyEntryRepository;
import com.zhengxian.moodecho.repository.UserRepository;
import com.zhengxian.moodecho.service.AiService;

@RestController
@RequestMapping("/api/entries")
public class JournalController {

    private final DailyEntryRepository repository;
    private final UserRepository userRepository;
    private final AiService aiService;

    public JournalController(DailyEntryRepository repository, UserRepository userRepository, AiService aiService) {
        this.repository = repository;
        this.userRepository = userRepository;
        this.aiService = aiService;
    }

    // 1. Create (only create for the authenticated user)
    @PostMapping
    public DailyEntry createEntry(@RequestBody Map<String, Object> payload, Principal principal) {
        // Principal includes the authenticated user's info
        String username = principal.getName();
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String journalText = (String) payload.get("journal");
        DailyEntry entry = new DailyEntry();
        entry.setUser(currentUser);  // current user association
        
        return processAndSaveEntry(journalText, payload, entry);
    }

    // 2. Read (only fetch own entries)
    @GetMapping
    public List<DailyEntry> getAllEntries(Principal principal) {
        String username = principal.getName();
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // only fetch entries for the current user to ensure data isolation
        return repository.findByUser(currentUser);
    }
    
    // 3. Update (only update own entries)
    @PutMapping("/{id}")
    public ResponseEntity<DailyEntry> updateEntry(@PathVariable @NonNull Long id, @RequestBody Map<String, Object> payload, Principal principal) {
        String username = principal.getName();
        
        return repository.findById(id)
                .map(existingEntry -> {
                    // check ownership before update
                    if (!existingEntry.getUser().getUsername().equals(username)) {
                        return ResponseEntity.status(403).<DailyEntry>build();
                    }
                    
                    String journalText = (String) payload.get("journal");
                    DailyEntry updated = processAndSaveEntry(journalText, payload, existingEntry);
                    return ResponseEntity.ok(updated);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // 4. Delete (only delete own entries)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEntry(@PathVariable @NonNull Long id, Principal principal) {
        String username = principal.getName();

        return repository.findById(id).map(entry -> {
             // check ownership before deletion
            if (!entry.getUser().getUsername().equals(username)) {
                return ResponseEntity.status(403).<Void>build();
            }
            repository.delete(entry);
            return ResponseEntity.ok().<Void>build();
        }).orElse(ResponseEntity.notFound().build());
    }

    // Common method to process AI analysis and save entry
    private DailyEntry processAndSaveEntry(String journalText, Map<String, Object> payload, DailyEntry entry) {
        Map<String, Object> aiResult;
        try {
            aiResult = aiService.analyzeJournal(journalText);
        } catch (Exception e) {
            aiResult = Map.of("mood_score", 5, "summary", "AI Analysis unavailable.");
        }

        entry.setEntryDate(LocalDate.now());
        entry.setJournalContent(journalText);
        
        Object moodObj = aiResult.get("mood_score");
        if (moodObj instanceof Integer moodInt) {
            entry.setMoodScore(moodInt);
        } else {
            entry.setMoodScore(5);
        }
        entry.setAiSummary((String) aiResult.get("summary"));

        if (payload.containsKey("habits")) {
            Object habitsObj = payload.get("habits");
            if (habitsObj instanceof List<?> list) {
                if (entry.getHabitLogs() != null) {
                    entry.getHabitLogs().clear();
                } else {
                    entry.setHabitLogs(new ArrayList<>());
                }
                
                for (Object item : list) {
                    HabitLog log = new HabitLog();
                    log.setHabitName(item.toString());
                    log.setCompleted(true);
                    log.setDailyEntry(entry);
                    entry.getHabitLogs().add(log);
                }
            }
        }
        return repository.save(entry);
    }
}