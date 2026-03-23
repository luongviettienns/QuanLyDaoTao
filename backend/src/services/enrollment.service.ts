import { z } from 'zod'
import { AppError } from '../utils/app-error.js'
import {
  createEnrollment,
  findAllOpenPeriodsByAcademicYearSemester,
  findCourseOfferingForEnrollment,
  findCourseOfferingBySubjectInSemester,
  findEnrollmentByIdAndStudent,
  findEnrollmentByStudentAndClass,
  findEnrollmentsByStudentId,
  findOpenRegistrationPeriodByClass,
  findOpenRegistrationPeriodForClass,
  findRegistrationPeriodClassLink,
  findStudentProfileByUserId,
  findWithdrawnOrDroppedEnrollmentByStudentAndClass,
  reactivateEnrollment,
  syncCourseOfferingCurrentEnrollment,
  withdrawEnrollment,
} from '../repositories/enrollment.repository.js'

const enrollmentPayloadSchema = z.object({
  classId: z.coerce.bigint(),
})

function mapSemesterLabel(semester: number | null) {
  if (semester === 1) return 'Học kỳ 1'
  if (semester === 2) return 'Học kỳ 2'
  if (semester === 3) return 'Học kỳ hè'
  return null
}

export function validateEnrollmentPayload(input: unknown) {
  const result = enrollmentPayloadSchema.safeParse(input)

  if (!result.success) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Dữ liệu đăng ký học phần không hợp lệ.', result.error.flatten())
  }

  return result.data
}

async function requireStudentProfile(userId: bigint) {
  const student = await findStudentProfileByUserId(userId)

  if (!student) {
    throw new AppError(404, 'STUDENT_PROFILE_NOT_FOUND', 'Không tìm thấy hồ sơ sinh viên.')
  }

  return student
}

export async function getMyEnrollments(userId: bigint) {
  const student = await requireStudentProfile(userId)
  const items = await findEnrollmentsByStudentId(student.studentId)

  return {
    student: {
      id: student.studentId.toString(),
      studentCode: student.studentCode,
      fullName: student.fullName,
    },
    items: items.map((item) => ({
      id: item.enrollmentId.toString(),
      enrollmentDate: item.enrollmentDate.toISOString(),
      enrollmentStatus: item.enrollmentStatus,
      dropDeadline: item.dropDeadline?.toISOString() ?? null,
      courseOffering: {
        id: item.class.classId.toString(),
        classCode: item.class.classCode,
        className: item.class.className,
        semester: item.class.semester,
        semesterLabel: mapSemesterLabel(item.class.semester),
        maxStudents: item.class.maxStudents,
        currentEnrollment: item.class.currentEnrollment,
        subject: {
          id: item.class.subject.subjectId.toString(),
          subjectCode: item.class.subject.subjectCode,
          subjectName: item.class.subject.subjectName,
          credits: item.class.subject.credits,
        },
        lecturer: item.class.lecturer
          ? {
              id: item.class.lecturer.lecturerId.toString(),
              code: item.class.lecturer.lecturerCode,
              fullName: item.class.lecturer.fullName,
            }
          : null,
        academicYear: {
          id: item.class.academicYear.academicYearId.toString(),
          yearName: item.class.academicYear.yearName,
          cohortCode: item.class.academicYear.cohortCode,
        },
        schoolYear: item.class.schoolYear
          ? {
              id: item.class.schoolYear.schoolYearId.toString(),
              yearCode: item.class.schoolYear.yearCode,
              yearName: item.class.schoolYear.yearName,
            }
          : null,
      },
    })),
  }
}

export async function createMyEnrollment(userId: bigint, input: ReturnType<typeof validateEnrollmentPayload>) {
  const now = new Date()
  const student = await requireStudentProfile(userId)

  const courseOffering = await findCourseOfferingForEnrollment(input.classId)
  if (!courseOffering) {
    throw new AppError(404, 'COURSE_OFFERING_NOT_FOUND', 'Không tìm thấy lớp học phần.')
  }

  if (courseOffering.semester === null) {
    throw new AppError(409, 'COURSE_OFFERING_SEMESTER_MISSING', 'Lớp học phần chưa được gán học kỳ hợp lệ.')
  }

  const openPeriods = await findAllOpenPeriodsByAcademicYearSemester(courseOffering.academicYearId, courseOffering.semester)
  if (!openPeriods.length) {
    throw new AppError(409, 'REGISTRATION_PERIOD_CLOSED', 'Hiện không có đợt đăng ký mở cho lớp học phần này.')
  }

  const registrationPeriod = await findOpenRegistrationPeriodForClass(
    courseOffering.classId,
    courseOffering.academicYearId,
    courseOffering.semester,
  )

  if (!registrationPeriod) {
    throw new AppError(409, 'COURSE_OFFERING_NOT_IN_OPEN_PERIOD', 'Lớp học phần chưa được mở trong đợt đăng ký hiện tại.')
  }

  if (now < registrationPeriod.startDate || now > registrationPeriod.endDate) {
    throw new AppError(409, 'REGISTRATION_PERIOD_OUT_OF_WINDOW', 'Hiện không nằm trong thời gian đăng ký hợp lệ.')
  }

  const periodClass = await findRegistrationPeriodClassLink(registrationPeriod.periodId, courseOffering.classId)
  if (!periodClass) {
    throw new AppError(409, 'COURSE_OFFERING_NOT_IN_OPEN_PERIOD', 'Lớp học phần chưa được gắn vào đợt đăng ký hiện tại.')
  }

  const sameSubjectEnrollment = await findCourseOfferingBySubjectInSemester(
    student.studentId,
    courseOffering.subject.subjectId,
    courseOffering.academicYearId,
    courseOffering.semester,
  )
  if (sameSubjectEnrollment) {
    throw new AppError(
      409,
      'SUBJECT_ALREADY_ENROLLED_IN_SEMESTER',
      `Sinh viên đã có đăng ký active cho môn này trong cùng học kỳ (${sameSubjectEnrollment.class.classCode}).`,
    )
  }

  const existing = await findEnrollmentByStudentAndClass(student.studentId, courseOffering.classId)
  if (existing && existing.enrollmentStatus !== 'WITHDRAWN' && existing.enrollmentStatus !== 'DROPPED') {
    throw new AppError(409, 'ENROLLMENT_EXISTS', 'Sinh viên đã đăng ký lớp học phần này.')
  }

  const reusableEnrollment = await findWithdrawnOrDroppedEnrollmentByStudentAndClass(student.studentId, courseOffering.classId)

  if (courseOffering.maxStudents !== null && courseOffering.currentEnrollment >= courseOffering.maxStudents) {
    throw new AppError(409, 'COURSE_OFFERING_FULL', 'Lớp học phần đã đủ sĩ số.')
  }

  const created = reusableEnrollment
    ? await reactivateEnrollment(reusableEnrollment.enrollmentId, courseOffering.classId)
    : await createEnrollment({
        studentId: student.studentId,
        classId: courseOffering.classId,
        status: 'APPROVED',
      })

  const currentEnrollment = await syncCourseOfferingCurrentEnrollment(courseOffering.classId)

  return {
    enrollment: {
      id: created.enrollmentId.toString(),
      enrollmentDate: created.enrollmentDate.toISOString(),
      enrollmentStatus: created.enrollmentStatus,
      student: {
        id: student.studentId.toString(),
        studentCode: student.studentCode,
        fullName: student.fullName,
      },
      courseOffering: {
        id: courseOffering.classId.toString(),
        classCode: courseOffering.classCode,
        className: courseOffering.className,
        semester: courseOffering.semester,
        semesterLabel: mapSemesterLabel(courseOffering.semester),
        currentEnrollment,
        subject: {
          id: courseOffering.subject.subjectId.toString(),
          subjectCode: courseOffering.subject.subjectCode,
          subjectName: courseOffering.subject.subjectName,
          credits: courseOffering.subject.credits,
        },
        lecturer: courseOffering.lecturer
          ? {
              id: courseOffering.lecturer.lecturerId.toString(),
              code: courseOffering.lecturer.lecturerCode,
              fullName: courseOffering.lecturer.fullName,
            }
          : null,
      },
      registrationPeriod: {
        id: registrationPeriod.periodId.toString(),
        periodName: registrationPeriod.periodName,
        status: registrationPeriod.status,
        periodType: registrationPeriod.periodType,
        startDate: registrationPeriod.startDate.toISOString(),
        endDate: registrationPeriod.endDate.toISOString(),
      },
    },
  }
}

export async function deleteMyEnrollment(userId: bigint, enrollmentId: bigint) {
  const now = new Date()
  const student = await requireStudentProfile(userId)

  const existing = await findEnrollmentByIdAndStudent(enrollmentId, student.studentId)
  if (!existing) {
    throw new AppError(404, 'ENROLLMENT_NOT_FOUND', 'Không tìm thấy đăng ký học phần.')
  }

  if (existing.enrollmentStatus === 'WITHDRAWN') {
    throw new AppError(409, 'ENROLLMENT_ALREADY_WITHDRAWN', 'Đăng ký học phần đã được huỷ trước đó.')
  }

  if (existing.enrollmentStatus !== 'APPROVED' && existing.enrollmentStatus !== 'PENDING') {
    throw new AppError(409, 'ENROLLMENT_STATUS_NOT_CANCELLABLE', 'Trạng thái đăng ký hiện tại không cho phép huỷ.')
  }

  const openPeriod = await findOpenRegistrationPeriodByClass(existing.classId)
  if (!openPeriod) {
    throw new AppError(409, 'REGISTRATION_PERIOD_CLOSED', 'Không thể huỷ vì đợt đăng ký hiện không mở.')
  }

  if (now < openPeriod.startDate || now > openPeriod.endDate) {
    throw new AppError(409, 'REGISTRATION_PERIOD_OUT_OF_WINDOW', 'Hiện không nằm trong thời gian huỷ đăng ký hợp lệ.')
  }

  // Giai đoạn hiện tại chưa map attendance/grades vào Prisma nên chưa chặn huỷ theo phát sinh học vụ.
  // Rule này sẽ được bổ sung khi mở rộng đầy đủ các module học vụ liên quan.
  await withdrawEnrollment(existing.enrollmentId, existing.classId)
  const currentEnrollment = await syncCourseOfferingCurrentEnrollment(existing.classId)

  return {
    ok: true,
    enrollmentId: existing.enrollmentId.toString(),
    currentEnrollment,
  }
}
