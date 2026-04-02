/**
 * Google Tasks API client wrapper.
 */

import { google } from "googleapis";
import type { OAuth2Client } from "google-auth-library";

export interface TaskItem {
  id?: string;
  title?: string;
  notes?: string;
  due?: string;
  status?: string;
  completed?: string;
  updated?: string;
}

export interface TaskList {
  id?: string;
  title?: string;
}

export interface TasksClient {
  listTasks(
    taskListId: string,
    showCompleted: boolean,
  ): Promise<TaskItem[]>;
  createTask(
    taskListId: string,
    params: { title: string; notes?: string; due?: string },
  ): Promise<TaskItem>;
  completeTask(taskListId: string, taskId: string): Promise<TaskItem>;
  listTaskLists(): Promise<TaskList[]>;
}

export function createTasksClient(auth: OAuth2Client): TasksClient {
  const tasks = google.tasks({ version: "v1", auth });

  return {
    async listTasks(taskListId, showCompleted) {
      const res = await tasks.tasks.list({
        tasklist: taskListId,
        showCompleted,
        showHidden: false,
        maxResults: 100,
      });

      return (res.data.items ?? []).map((t) => ({
        id: t.id ?? undefined,
        title: t.title ?? undefined,
        notes: t.notes ?? undefined,
        due: t.due ?? undefined,
        status: t.status ?? undefined,
        completed: t.completed ?? undefined,
        updated: t.updated ?? undefined,
      }));
    },

    async createTask(taskListId, params) {
      const res = await tasks.tasks.insert({
        tasklist: taskListId,
        requestBody: {
          title: params.title,
          notes: params.notes,
          due: params.due,
        },
      });

      return {
        id: res.data.id ?? undefined,
        title: res.data.title ?? undefined,
        notes: res.data.notes ?? undefined,
        due: res.data.due ?? undefined,
        status: res.data.status ?? undefined,
      };
    },

    async completeTask(taskListId, taskId) {
      const res = await tasks.tasks.patch({
        tasklist: taskListId,
        task: taskId,
        requestBody: {
          status: "completed",
        },
      });

      return {
        id: res.data.id ?? undefined,
        title: res.data.title ?? undefined,
        status: res.data.status ?? undefined,
        completed: res.data.completed ?? undefined,
      };
    },

    async listTaskLists() {
      const res = await tasks.tasklists.list({ maxResults: 100 });
      return (res.data.items ?? []).map((tl) => ({
        id: tl.id ?? undefined,
        title: tl.title ?? undefined,
      }));
    },
  };
}
