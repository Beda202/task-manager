import { Component, OnInit, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../task.service';
import { Task, TaskStatus } from '../task';

type SortOption = 'date' | 'priority';

const PRIORITY_WEIGHT: Record<Task['priority'], number> = {
  high: 0,
  medium: 1,
  low: 2,
};

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
  sortBy = signal<SortOption>('date');
  toastMessage = signal<string | null>(null);

  constructor(public taskService: TaskService) {}

  ngOnInit(): void {
    this.taskService.loadTasks();

    const state = history.state as { message?: string } | undefined;
    if (state?.message) {
      this.toastMessage.set(state.message);
      setTimeout(() => this.toastMessage.set(null), 2500);
      // clear it from history so a manual refresh doesn't re-show the toast
      history.replaceState({}, '');
    }
  }

  counts = computed(() => {
    const tasks = this.taskService.tasks();
    return {
      all: tasks.length,
      todo: tasks.filter((t) => t.status === 'todo').length,
      'in-progress': tasks.filter((t) => t.status === 'in-progress').length,
      done: tasks.filter((t) => t.status === 'done').length,
    };
  });

  filteredTasks = computed(() => {
    const filter = this.statusFilter();
    const search = this.searchTerm().trim().toLowerCase();
    const sort = this.sortBy();
    let tasks = this.taskService.tasks();

    if (filter !== 'all') {
      tasks = tasks.filter((t) => t.status === filter);
    }

    if (search) {
      tasks = tasks.filter((t) => t.title.toLowerCase().includes(search));
    }

    tasks = [...tasks].sort((a, b) => {
      if (sort === 'priority') {
        return PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority];
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return tasks;
  });

  setFilter(filter: TaskStatus | 'all'): void {
    this.statusFilter.set(filter);
  }

  setSort(sort: SortOption): void {
    this.sortBy.set(sort);
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