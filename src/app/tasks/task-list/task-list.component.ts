import { Component, OnInit, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../task.service';
import { TaskStatus } from '../task';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.scss',
})
export class TaskListComponent implements OnInit {
  statusFilter = signal<TaskStatus | 'all'>('all');
  searchTerm = signal<string>('');

  constructor(public taskService: TaskService) {}

  ngOnInit(): void {
    this.taskService.loadTasks();
  }

  filteredTasks = computed(() => {
    const filter = this.statusFilter();
    const search = this.searchTerm().trim().toLowerCase();
    let tasks = this.taskService.tasks();

    if (filter !== 'all') {
      tasks = tasks.filter((t) => t.status === filter);
    }

    if (search) {
      tasks = tasks.filter((t) => t.title.toLowerCase().includes(search));
    }

    return tasks;
  });

  setFilter(filter: TaskStatus | 'all'): void {
    this.statusFilter.set(filter);
  }

  onSearchChange(value: string): void {
    this.searchTerm.set(value);
  }

  onDelete(id: number, event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    if (confirm('Delete this task?')) {
      this.taskService.deleteTask(id);
    }
  }
}