import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, delay } from 'rxjs';
import { Task, NewTask, TaskStatus } from './task';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private readonly _tasks = signal<Task[]>([]);
  private readonly _loading = signal<boolean>(false);

  readonly tasks = this._tasks.asReadonly();
  readonly loading = this._loading.asReadonly();

  readonly totalTasks = computed(() => this._tasks().length);
  readonly doneCount = computed(
    () => this._tasks().filter((t) => t.status === 'done').length
  );

  private nextId = 1;
  private hasLoaded = false;

  constructor(private http: HttpClient) {}

  loadTasks(): void {
    if (this.hasLoaded) {
      return;
    }
    this.hasLoaded = true;
    this._loading.set(true);

    const seed: Task[] = [
      {
        id: this.nextId++,
        title: 'Setup Angular project structure',
        description: 'Create standalone components, routing and base styling.',
        status: 'done',
        priority: 'high',
        createdAt: new Date().toISOString(),
      },
      {
        id: this.nextId++,
        title: 'Build Task List page',
        description: 'Display tasks with filter by status and priority.',
        status: 'in-progress',
        priority: 'high',
        createdAt: new Date().toISOString(),
      },
      {
        id: this.nextId++,
        title: 'Connect Reactive Form for new tasks',
        description: 'Add validation and submit handling.',
        status: 'todo',
        priority: 'medium',
        createdAt: new Date().toISOString(),
      },
    ];

    new Observable<Task[]>((subscriber) => {
      subscriber.next(seed);
      subscriber.complete();
    })
      .pipe(delay(400))
      .subscribe((tasks) => {
        this._tasks.set(tasks);
        this._loading.set(false);
      });
  }

  getTaskById(id: number): Task | undefined {
    return this._tasks().find((t) => t.id === id);
  }

  addTask(newTask: NewTask): void {
    const task: Task = {
      ...newTask,
      id: this.nextId++,
      createdAt: new Date().toISOString(),
    };
    this._tasks.update((tasks) => [task, ...tasks]);
  }

  updateTask(id: number, changes: Partial<Task>): void {
    this._tasks.update((tasks) =>
      tasks.map((t) => (t.id === id ? { ...t, ...changes } : t))
    );
  }

  updateStatus(id: number, status: TaskStatus): void {
    this.updateTask(id, { status });
  }

  deleteTask(id: number): void {
    this._tasks.update((tasks) => tasks.filter((t) => t.id !== id));
  }
}
