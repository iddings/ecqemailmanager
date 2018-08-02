import {MacroData, Partial, Schedule, Task} from "../models";
import {deepCopy} from "./helpers";

export const updateState = (state: MacroData, changes: Partial<MacroData>) => {

  // ensure we don't have any crossed pointers
  changes = deepCopy(changes);

  // update primitives
  const primitiveKeys = ['email_subject', 'email_text', 'name', 'enabled'];

  updatePrimitiveObject(state, changes, primitiveKeys);

  // update primitive arrays
  const primitiveArrayKeys = ['email_addresses'];

  for (let k of primitiveArrayKeys)
    if (changes.hasOwnProperty(k))
      updatePrimitiveArray(state[k], changes[k]);

  // update task state
  if (changes.tasks) updateTaskState(state.tasks, changes.tasks);

  // update schedule state
  if (changes.schedule) updateScheduleState(state.schedule, changes.schedule);

};

const updateTaskState = (tasks: Task[], newData: Task[]) => {

  const primitiveKeys = ['format', 'report_file', 'output_file', 'task_seq'],
    lengthDif = newData.length - tasks.length;

  // Normalize array lengths

  // If tasks are added
  if (lengthDif > 0)
    for (let i = 0; i < lengthDif; i++)
      tasks.push({
        format: null,
        report_file: null,
        output_file: null,
        task_seq: null
      });

  // If tasks are removed
  else if (lengthDif < 0)
    tasks.splice(0, lengthDif * -1);

  // Update primitive keys
  for (let i = 0, j = newData.length; i < j; i++)
    updatePrimitiveObject(tasks[i], newData[i], primitiveKeys);

};

const updateScheduleState = (sched: Schedule, newData: Partial<Schedule>) => {

  const primitiveKeys = ['day', 'day_of_week', 'hour', 'minute'];

  // update primitives
  updatePrimitiveObject(sched, newData, primitiveKeys);

};

const updatePrimitiveObject = (obj: any, newData: any, keys: string[]) => {

  for (let k of keys)
    if (newData.hasOwnProperty(k))
      obj[k] = newData[k]

};

const updatePrimitiveArray = (arr: any[], newData: any[]) => {

  arr.splice(0, arr.length);
  arr.push(...newData);

};
