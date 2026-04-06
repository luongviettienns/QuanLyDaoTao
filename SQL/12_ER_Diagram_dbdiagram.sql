-- ===========================================
-- 🎓 HỆ THỐNG QUẢN LÝ ĐIỂM DANH SINH VIÊN
-- ER Diagram - dbdiagram.io Format
-- Generated: 2026-04-02
-- Copy to: https://dbdiagram.io/d
-- ===========================================

-- Cách sử dụng:
-- 1. Truy cập https://dbdiagram.io/d
-- 2. Paste toàn bộ nội dung này vào
-- 3. Nhấn "Run" để xem ER Diagram

-- ===== CORE SYSTEM =====

Table roles {
  role_id varchar [pk]
  role_name nvarchar [unique]
  description nvarchar
  is_active bit [default: 1]
  created_at datetime
  created_by varchar
  updated_at datetime
  updated_by varchar
  deleted_at datetime
  deleted_by varchar
}

Table users {
  user_id varchar [pk]
  username varchar [unique]
  password_hash varchar
  email varchar [unique]
  phone varchar
  full_name nvarchar
  avatar_url varchar
  role_id varchar [ref: > roles.role_id]
  is_active bit [default: 1]
  last_login_at datetime
  created_at datetime
  created_by varchar
  updated_at datetime
  updated_by varchar
  deleted_at datetime
  deleted_by varchar
}

Table permissions {
  permission_id varchar [pk]
  permission_code varchar [unique]
  permission_name nvarchar
  description nvarchar
  parent_code varchar
  icon varchar
  sort_order int
  is_active bit [default: 1]
  is_menu_only bit [default: 0]
  created_at datetime
  created_by varchar
  updated_at datetime
  updated_by varchar
  deleted_at datetime
  deleted_by varchar
}

Table role_permissions {
  role_id varchar [pk]
  permission_id varchar [pk]
  created_at datetime
  created_by varchar
}

Table audit_logs {
  log_id bigint [pk]
  user_id varchar
  action varchar
  entity_type varchar
  entity_id varchar
  old_values nvarchar
  new_values nvarchar
  ip_address varchar
  user_agent varchar
  created_at datetime
}

Table refresh_tokens {
  id uniqueidentifier [pk]
  user_id varchar [ref: > users.user_id]
  token varchar [unique]
  expires_at datetime
  created_at datetime
  revoked_at datetime
  replaced_by_token varchar
}

-- ===== ACADEMIC STRUCTURE =====

Table faculties {
  faculty_id varchar [pk]
  faculty_code varchar [unique]
  faculty_name nvarchar [unique]
  description nvarchar
  is_active bit [default: 1]
  created_at datetime
  created_by varchar
  updated_at datetime
  updated_by varchar
  deleted_at datetime
  deleted_by varchar
}

Table departments {
  department_id varchar [pk]
  department_code varchar [unique]
  department_name nvarchar
  faculty_id varchar [ref: > faculties.faculty_id]
  description nvarchar
  created_at datetime
  created_by varchar
  updated_at datetime
  updated_by varchar
  deleted_at datetime
  deleted_by varchar
}

Table majors {
  major_id varchar [pk]
  major_name nvarchar
  major_code varchar [unique]
  faculty_id varchar [ref: > faculties.faculty_id]
  description nvarchar
  created_at datetime
  created_by varchar
  updated_at datetime
  updated_by varchar
  deleted_at datetime
  deleted_by varchar
}

Table academic_years {
  academic_year_id varchar [pk]
  year_name nvarchar [unique]
  cohort_code nvarchar
  start_year int
  end_year int
  duration_years int [default: 4]
  description nvarchar
  is_active bit [default: 0]
  created_at datetime
  created_by varchar
  updated_at datetime
  updated_by varchar
  deleted_at datetime
  deleted_by varchar
}

Table school_years {
  school_year_id varchar [pk]
  year_code nvarchar [unique]
  year_name nvarchar
  academic_year_id varchar [ref: > academic_years.academic_year_id]
  start_date date
  end_date date
  semester1_start date
  semester1_end date
  semester2_start date
  semester2_end date
  is_active bit [default: 0]
  current_semester int
  created_at datetime
  created_by varchar
  updated_at datetime
  updated_by varchar
  deleted_at datetime
  deleted_by varchar
}

-- ===== PEOPLE =====

Table lecturers {
  lecturer_id varchar [pk]
  lecturer_code varchar [unique]
  full_name nvarchar
  email varchar
  phone varchar
  department_id varchar [ref: > departments.department_id]
  user_id varchar [ref: > users.user_id]
  is_active bit [default: 1]
  created_at datetime
  created_by varchar
  updated_at datetime
  updated_by varchar
  deleted_at datetime
  deleted_by varchar
}

Table students {
  student_id varchar [pk]
  student_code varchar [unique]
  full_name nvarchar
  date_of_birth date
  gender nvarchar
  email varchar
  phone varchar
  address nvarchar
  major_id varchar [ref: > majors.major_id]
  academic_year_id varchar [ref: > academic_years.academic_year_id]
  advisor_id varchar
  user_id varchar [ref: > users.user_id]
  last_warning_sent datetime
  is_active bit [default: 1]
  created_at datetime
  created_by varchar
  updated_at datetime
  updated_by varchar
  deleted_at datetime
  deleted_by varchar
}

Table administrative_classes {
  admin_class_id varchar [pk]
  class_code varchar [unique]
  class_name nvarchar
  major_id varchar [ref: > majors.major_id]
  advisor_id varchar [ref: > lecturers.lecturer_id]
  academic_year_id varchar [ref: > academic_years.academic_year_id]
  cohort_year int
  max_students int [default: 50]
  current_students int [default: 0]
  description nvarchar
  is_active bit [default: 1]
  created_at datetime
  created_by varchar
  updated_at datetime
  updated_by varchar
  deleted_at datetime
  deleted_by varchar
}

-- ===== ACADEMIC CORE =====

Table subjects {
  subject_id varchar [pk]
  subject_code varchar [unique]
  subject_name nvarchar
  credits int
  department_id varchar [ref: > departments.department_id]
  description nvarchar
  created_at datetime
  created_by varchar
  updated_at datetime
  updated_by varchar
  deleted_at datetime
  deleted_by varchar
}

Table subject_prerequisites {
  prerequisite_id varchar [pk]
  subject_id varchar [ref: > subjects.subject_id]
  prerequisite_subject_id varchar [ref: > subjects.subject_id]
  description nvarchar
  is_active bit [default: 1]
  created_at datetime
  created_by varchar
}

Table classes {
  class_id varchar [pk]
  class_code varchar [unique]
  class_name nvarchar
  subject_id varchar [ref: > subjects.subject_id]
  lecturer_id varchar [ref: > lecturers.lecturer_id]
  academic_year_id varchar [ref: > academic_years.academic_year_id]
  school_year_id varchar [ref: > school_years.school_year_id]
  semester int
  max_students int
  current_enrollment int [default: 0]
  schedule nvarchar
  room nvarchar
  created_at datetime
  created_by varchar
  updated_at datetime
  updated_by varchar
  deleted_at datetime
  deleted_by varchar
}

Table enrollments {
  enrollment_id varchar [pk]
  student_id varchar [ref: > students.student_id]
  class_id varchar [ref: > classes.class_id]
  enrollment_date datetime
  status nvarchar
  created_at datetime
  created_by varchar
  deleted_at datetime
  deleted_by varchar
}

Table attendances {
  attendance_id varchar [pk]
  enrollment_id varchar [ref: > enrollments.enrollment_id]
  class_id varchar [ref: > classes.class_id]
  attendance_date datetime
  status nvarchar
  note nvarchar
  marked_by varchar
  created_at datetime
  created_by varchar
  updated_at datetime
  updated_by varchar
  deleted_at datetime
  deleted_by varchar
}

Table grades {
  grade_id varchar [pk]
  enrollment_id varchar [ref: > enrollments.enrollment_id]
  midterm_score decimal
  final_score decimal
  total_score decimal
  letter_grade varchar
  attendance_score decimal
  assignment_score decimal
  created_at datetime
  created_by varchar
  updated_at datetime
  updated_by varchar
  deleted_at datetime
  deleted_by varchar
}

Table gpas {
  gpa_id varchar [pk]
  student_id varchar [ref: > students.student_id]
  academic_year_id varchar [ref: > academic_years.academic_year_id]
  school_year_id varchar [ref: > school_years.school_year_id]
  semester int
  gpa10 decimal
  gpa4 decimal
  total_credits int [default: 0]
  accumulated_credits int [default: 0]
  rank_text nvarchar
  is_active bit [default: 1]
  created_at datetime
  created_by varchar
  updated_at datetime
  updated_by varchar
  deleted_at datetime
  deleted_by varchar
}

-- ===== REGISTRATION =====

Table registration_periods {
  period_id varchar [pk]
  period_name nvarchar
  academic_year_id varchar [ref: > academic_years.academic_year_id]
  semester int
  start_date date
  end_date date
  status nvarchar
  description nvarchar
  is_active bit [default: 1]
  created_at datetime
  created_by varchar
  updated_at datetime
  updated_by varchar
  deleted_at datetime
  deleted_by varchar
}

Table period_classes {
  period_class_id varchar [pk]
  period_id varchar [ref: > registration_periods.period_id]
  class_id varchar [ref: > classes.class_id]
  is_active bit [default: 1]
  created_at datetime
  created_by varchar
  updated_at datetime
  updated_by varchar
  deleted_at datetime
  deleted_by varchar
}

-- ===== TIMETABLE & ROOMS =====

Table rooms {
  room_id varchar [pk]
  room_code varchar [unique]
  room_name nvarchar
  building nvarchar
  room_type nvarchar
  capacity int
  facilities nvarchar
  is_active bit [default: 1]
  created_at datetime
  created_by varchar
  updated_at datetime
  updated_by varchar
  deleted_at datetime
  deleted_by varchar
}

Table timetable_sessions {
  session_id varchar [pk]
  class_id varchar [ref: > classes.class_id]
  subject_id varchar [ref: > subjects.subject_id]
  lecturer_id varchar [ref: > lecturers.lecturer_id]
  room_id varchar [ref: > rooms.room_id]
  school_year_id varchar [ref: > school_years.school_year_id]
  week_no int
  weekday int
  start_time time
  end_time time
  period_from int
  period_to int
  recurrence nvarchar
  duration_minutes int
  status nvarchar
  notes nvarchar
  created_at datetime
  created_by varchar
  updated_at datetime
  updated_by varchar
  deleted_at datetime
  deleted_by varchar
}

-- ===== GRADE MANAGEMENT =====

Table grade_formula_config {
  config_id varchar [pk]
  subject_id varchar [ref: > subjects.subject_id]
  midterm_weight decimal
  final_weight decimal
  attendance_weight decimal
  assignment_weight decimal
  lab_weight decimal
  project_weight decimal
  is_active bit [default: 1]
  created_at datetime
  created_by varchar
  updated_at datetime
  updated_by varchar
  deleted_at datetime
  deleted_by varchar
}

Table grade_appeals {
  appeal_id varchar [pk]
  enrollment_id varchar [ref: > enrollments.enrollment_id]
  appeal_reason nvarchar
  admin_notes nvarchar
  status nvarchar
  appeal_date datetime
  processed_date datetime
  processed_by varchar
  created_at datetime
  created_by varchar
  updated_at datetime
  updated_by varchar
  deleted_at datetime
  deleted_by varchar
}

Table retake_records {
  retake_id varchar [pk]
  enrollment_id varchar [ref: > enrollments.enrollment_id]
  retake_fee decimal
  status nvarchar
  exam_date datetime
  exam_room varchar
  created_at datetime
  created_by varchar
  updated_at datetime
  updated_by varchar
  deleted_at datetime
  deleted_by varchar
}

-- ===== EXAM MANAGEMENT =====

Table exam_schedules {
  exam_id varchar [pk]
  class_id varchar [ref: > classes.class_id]
  exam_name nvarchar
  exam_type nvarchar
  exam_date date
  start_time time
  end_time time
  room_id varchar [ref: > rooms.room_id]
  duration_minutes int
  total_students int
  notes nvarchar
  status nvarchar
  created_at datetime
  created_by varchar
  updated_at datetime
  updated_by varchar
  deleted_at datetime
  deleted_by varchar
}

Table exam_assignments {
  assignment_id varchar [pk]
  exam_id varchar [ref: > exam_schedules.exam_id]
  student_id varchar [ref: > students.student_id]
  seat_number nvarchar
  status nvarchar
  score decimal
  created_at datetime
  created_by varchar
  updated_at datetime
  updated_by varchar
  deleted_at datetime
  deleted_by varchar
}

-- ===== ADVISOR =====

Table advisor_warning_config {
  config_id int [pk]
  attendance_threshold decimal [default: 20.0]
  gpa_threshold decimal [default: 2.0]
  email_template nvarchar
  email_subject nvarchar
  auto_send_emails bit [default: 0]
  created_at datetime
  created_by varchar
  updated_at datetime
  updated_by varchar
}

-- ===== NOTIFICATIONS =====

Table notifications {
  notification_id varchar [pk]
  user_id varchar
  message nvarchar
  notification_type nvarchar
  recipient_id varchar
  title nvarchar
  content nvarchar
  type nvarchar
  is_read bit [default: 0]
  sent_date datetime
  is_active bit [default: 1]
  created_at datetime
  created_by varchar
  updated_at datetime
  updated_by varchar
  deleted_at datetime
  deleted_by varchar
}

-- ===== STUDENT TRANSFERS =====

Table student_class_transfers {
  transfer_id varchar [pk]
  student_id varchar [ref: > students.student_id]
  from_class_id varchar [ref: > classes.class_id]
  to_class_id varchar [ref: > classes.class_id]
  reason nvarchar
  status nvarchar
  transfer_date datetime
  approved_date datetime
  approved_by varchar
  created_at datetime
  created_by varchar
  updated_at datetime
  updated_by varchar
  deleted_at datetime
  deleted_by varchar
}
