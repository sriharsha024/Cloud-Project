package com.projects;

import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/tasks")
@CrossOrigin(origins = "http://localhost:3000") // React frontend
public class TaskController {

    private final TaskRepository repo;

    public TaskController(TaskRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public List<Task> getTasks() {
        return repo.findAll();
    }

    @PostMapping
    public Task addTask(@RequestBody Task task) {
        if (task.getDeadline() != null && task.getDeadline().isBefore(LocalDate.now())) {
            throw new RuntimeException("Deadline cannot be before today");
        }
        return repo.save(task);
    }

    @PutMapping("/{id}")
    public Task updateTask(@PathVariable("id") Long id, @RequestBody Task updated) {
        return repo.findById(id).map(task -> {
            task.setDescription(updated.getDescription());
            task.setDone(updated.isDone());
            task.setDeadline(updated.getDeadline());
            return repo.save(task);
        }).orElseThrow(() -> new RuntimeException("Task not found"));
    }

    @DeleteMapping("/{id}")
    public void deleteTask(@PathVariable("id") Long id) {
        repo.deleteById(id);
    }
}
