import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TaskService } from '../task.service';
import { Task, TaskStatus } from '../task';

@Component({
  selector: 'app-task-detail',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './task-detail.component.html',
  styleUrl: './task-detail.component.scss',
})
export class TaskDetailComponent implements OnInit {
  task = signal<Task | undefined>(undefined);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private taskService: TaskService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.task.set(this.taskService.getTaskById(id));
  }

  changeStatus(status: TaskStatus): void {
    const current = this.task();
    if (!current) return;
    this.taskService.updateStatus(current.id, status);
    this.task.set(this.taskService.getTaskById(current.id));
  }

  onDelete(): void {
    const current = this.task();
    if (!current) return;
    if (confirm('Delete this task?')) {
      this.taskService.deleteTask(current.id);
      this.router.navigate(['/tasks']);
    }
  }
}
