export type Partial<T> = {
  [P in keyof T]?: T[P];
}

export interface AppData {
  emails: string[]
  users: string[]
  report_files: ReportFile[]
}

export interface MacroData {
  email_addresses: string[]
  email_subject: string
  email_text: string
  id: number
  name: string
  schedule: Schedule
  enabled: boolean
  tasks: Task[]
}


export interface Schedule {
  day: string
  day_of_week: string
  hour: string
  minute: string
}

export interface Task {
  format: string
  report_file: string
  output_file: string
  task_seq: number
}

export interface ReportFile {
  id: string
  source_file: string
  source_user: string
}
