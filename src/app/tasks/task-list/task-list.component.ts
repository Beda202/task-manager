import { Component, OnInit, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TaskService } from '../task.service';
import { TaskStatus } from '../task';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.scss',
})
export class TaskListComponent implements OnInit {
  statusFilter = signal<TaskStatus | 'all'>('all');

  constructor(public taskService: TaskService) {}

  ngOnInit(): void {
    this.taskService.loadTasks();
  }

  filteredTasks = computed(() => {
    const filter = this.statusFilter();
    const all = this.taskService.tasks();
    return filter === 'all' ? all : all.filter((t) => t.status === filter);
  });

  setFilter(filter: TaskStatus | 'all'): void {
    this.statusFilter.set(filter);
  }

  onDelete(id: number, event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    if (confirm('Delete this task?')) {
      this.taskService.deleteTask(id);
    }
  }
}
