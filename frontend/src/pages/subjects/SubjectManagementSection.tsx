import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { ApiError } from '@/app/auth/auth-api'
import { useAuth } from '@/app/auth/auth-provider'
import {
  createSubjectApi,
  deleteSubjectApi,
  getDepartmentsApi,
  getSubjectByIdApi,
  getSubjectsApi,
  updateSubjectApi,
  type DepartmentItem,
  type SubjectItem,
} from '@/app/subjects/subject-api'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type FormState = {
  subjectCode: string
  subjectName: string
  credits: string
  departmentId: string
  description: string
}

const initialFormState: FormState = {
  subjectCode: '',
  subjectName: '',
  credits: '3',
  departmentId: '',
  description: '',
}

function formatDateTime(iso: string | null) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString('vi-VN')
  } catch {
    return iso
  }
}

function isSessionFatalError(error: unknown) {
  return error instanceof ApiError && (error.code === 'SESSION_EXPIRED' || error.code === 'UNAUTHORIZED')
}

export function SubjectManagementSection() {
  const { accessToken } = useAuth()
  const [subjects, setSubjects] = useState<SubjectItem[]>([])
  const [departments, setDepartments] = useState<DepartmentItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingSubjectId, setDeletingSubjectId] = useState<string | null>(null)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [form, setForm] = useState<FormState>(initialFormState)

  const [detailSubjectId, setDetailSubjectId] = useState<string | null>(null)
  const [detailSubject, setDetailSubject] = useState<SubjectItem | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  const [editSubject, setEditSubject] = useState<SubjectItem | null>(null)
  const [editForm, setEditForm] = useState<FormState>(initialFormState)
  const [isSavingEdit, setIsSavingEdit] = useState(false)

  useEffect(() => {
    if (!accessToken) {
      setIsLoading(false)
      return
    }

    let isMounted = true

    void Promise.all([getSubjectsApi(), getDepartmentsApi()])
      .then(([subjectData, departmentData]) => {
        if (!isMounted) return

        setSubjects(subjectData.items)
        setDepartments(departmentData.items)
        setForm((prev) => ({
          ...prev,
          departmentId: prev.departmentId || departmentData.items[0]?.id || '',
        }))
      })
      .catch((error) => {
        if (isSessionFatalError(error)) return
        const message = error instanceof ApiError ? error.message : 'Không tải được dữ liệu môn học.'
        toast.error(message)
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [accessToken])

  useEffect(() => {
    if (!accessToken || !detailSubjectId) {
      setDetailSubject(null)
      return
    }

    let cancelled = false
    setDetailLoading(true)
    void getSubjectByIdApi(detailSubjectId)
      .then(({ subject }) => {
        if (!cancelled) setDetailSubject(subject)
      })
      .catch((error) => {
        if (isSessionFatalError(error)) {
          if (!cancelled) {
            setDetailSubjectId(null)
            setDetailSubject(null)
          }
          return
        }
        const message = error instanceof ApiError ? error.message : 'Không tải được chi tiết môn học.'
        toast.error(message)
        if (!cancelled) {
          setDetailSubjectId(null)
          setDetailSubject(null)
        }
      })
      .finally(() => {
        if (!cancelled) setDetailLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [accessToken, detailSubjectId])

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape') return
      if (detailSubjectId) setDetailSubjectId(null)
      if (editSubject) setEditSubject(null)
    }
    if (detailSubjectId || editSubject) {
      window.addEventListener('keydown', onKeyDown)
      return () => window.removeEventListener('keydown', onKeyDown)
    }
    return undefined
  }, [detailSubjectId, editSubject])

  const filteredSubjects = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase()
    if (!keyword) return subjects

    return subjects.filter(
      (item) =>
        item.subjectCode.toLowerCase().includes(keyword) ||
        item.subjectName.toLowerCase().includes(keyword) ||
        item.department.name.toLowerCase().includes(keyword),
    )
  }, [searchKeyword, subjects])

  async function handleCreateSubject(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!accessToken) {
      toast.error('Phiên đăng nhập không hợp lệ.')
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        subjectCode: form.subjectCode.trim(),
        subjectName: form.subjectName.trim(),
        credits: Number(form.credits),
        departmentId: form.departmentId,
        description: form.description.trim() ? form.description.trim() : null,
      }

      const result = await createSubjectApi(payload)
      setSubjects((prev) => [result.subject, ...prev])
      setForm((prev) => ({
        ...initialFormState,
        credits: prev.credits,
        departmentId: prev.departmentId,
      }))
      toast.success(`Đã tạo môn học ${result.subject.subjectCode}.`)
    } catch (error) {
      if (isSessionFatalError(error)) return
      const message = error instanceof ApiError ? error.message : 'Tạo môn học thất bại.'
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDeleteSubject(subject: SubjectItem) {
    if (!accessToken) {
      toast.error('Phiên đăng nhập không hợp lệ.')
      return
    }

    const shouldDelete = window.confirm(`Bạn có chắc muốn xoá môn học ${subject.subjectCode} không?`)
    if (!shouldDelete) return

    setDeletingSubjectId(subject.id)
    try {
      await deleteSubjectApi(subject.id)
      setSubjects((prev) => prev.filter((item) => item.id !== subject.id))
      toast.success(`Đã xoá môn học ${subject.subjectCode}.`)
    } catch (error) {
      if (isSessionFatalError(error)) return
      const message = error instanceof ApiError ? error.message : 'Xoá môn học thất bại.'
      toast.error(message)
    } finally {
      setDeletingSubjectId(null)
    }
  }

  function openEdit(subject: SubjectItem) {
    setEditSubject(subject)
    setEditForm({
      subjectCode: subject.subjectCode,
      subjectName: subject.subjectName,
      credits: String(subject.credits),
      departmentId: subject.department.id,
      description: subject.description ?? '',
    })
  }

  async function handleUpdateSubject(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!accessToken || !editSubject) {
      toast.error('Phiên đăng nhập không hợp lệ.')
      return
    }

    setIsSavingEdit(true)
    try {
      const payload = {
        subjectCode: editForm.subjectCode.trim(),
        subjectName: editForm.subjectName.trim(),
        credits: Number(editForm.credits),
        departmentId: editForm.departmentId,
        description: editForm.description.trim() ? editForm.description.trim() : null,
      }

      await updateSubjectApi(editSubject.id, payload)
      const { subject: fresh } = await getSubjectByIdApi(editSubject.id)
      setSubjects((prev) => prev.map((item) => (item.id === fresh.id ? fresh : item)))
      setEditSubject(null)
      toast.success(`Đã cập nhật môn học ${fresh.subjectCode}.`)
    } catch (error) {
      if (isSessionFatalError(error)) return
      const message = error instanceof ApiError ? error.message : 'Cập nhật môn học thất bại.'
      toast.error(message)
    } finally {
      setIsSavingEdit(false)
    }
  }

  if (!accessToken) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Không có access token</AlertTitle>
        <AlertDescription>Vui lòng đăng nhập lại để sử dụng chức năng quản lý môn học.</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {detailSubjectId ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            aria-label="Đóng"
            onClick={() => setDetailSubjectId(null)}
          />
          <Card className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto shadow-lg">
            <CardHeader>
              <CardTitle>Chi tiết môn học</CardTitle>
              <CardDescription>Thông tin đầy đủ từ hệ thống.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-sm">
              {detailLoading || !detailSubject ? (
                <p className="text-muted-foreground">Đang tải chi tiết...</p>
              ) : (
                <dl className="grid gap-2">
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Mã môn</dt>
                    <dd className="font-medium">{detailSubject.subjectCode}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Tên môn</dt>
                    <dd className="text-right">{detailSubject.subjectName}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Tín chỉ</dt>
                    <dd>{detailSubject.credits}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Bộ môn</dt>
                    <dd className="text-right">
                      {detailSubject.department.code} — {detailSubject.department.name}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Trạng thái</dt>
                    <dd>{detailSubject.isActive ? 'Đang hoạt động' : 'Ngừng hoạt động'}</dd>
                  </div>
                  <div className="flex flex-col gap-1">
                    <dt className="text-muted-foreground">Mô tả</dt>
                    <dd className="text-foreground">{detailSubject.description || '—'}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Tạo lúc</dt>
                    <dd>{formatDateTime(detailSubject.createdAt)}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Cập nhật</dt>
                    <dd>{formatDateTime(detailSubject.updatedAt)}</dd>
                  </div>
                </dl>
              )}
              <div className="pt-2">
                <Button type="button" variant="outline" onClick={() => setDetailSubjectId(null)}>
                  Đóng
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {editSubject ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            aria-label="Đóng"
            onClick={() => setEditSubject(null)}
          />
          <Card className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto shadow-lg">
            <CardHeader>
              <CardTitle>Sửa môn học</CardTitle>
              <CardDescription>
                Cập nhật {editSubject.subjectCode} — {editSubject.subjectName}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateSubject} className="grid gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="edit-subjectCode">Mã môn học</Label>
                  <Input
                    id="edit-subjectCode"
                    value={editForm.subjectCode}
                    onChange={(event) => setEditForm((prev) => ({ ...prev, subjectCode: event.target.value }))}
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="edit-subjectName">Tên môn học</Label>
                  <Input
                    id="edit-subjectName"
                    value={editForm.subjectName}
                    onChange={(event) => setEditForm((prev) => ({ ...prev, subjectName: event.target.value }))}
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="edit-credits">Số tín chỉ</Label>
                  <Input
                    id="edit-credits"
                    type="number"
                    min={1}
                    max={50}
                    value={editForm.credits}
                    onChange={(event) => setEditForm((prev) => ({ ...prev, credits: event.target.value }))}
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="edit-departmentId">Bộ môn / Khoa</Label>
                  <select
                    id="edit-departmentId"
                    value={editForm.departmentId}
                    onChange={(event) => setEditForm((prev) => ({ ...prev, departmentId: event.target.value }))}
                    className="h-8 rounded-lg border border-input bg-background px-2.5 text-sm"
                    required
                  >
                    {departments.map((department) => (
                      <option key={department.id} value={department.id}>
                        {department.code} - {department.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="edit-description">Mô tả (tuỳ chọn)</Label>
                  <Input
                    id="edit-description"
                    value={editForm.description}
                    onChange={(event) => setEditForm((prev) => ({ ...prev, description: event.target.value }))}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button disabled={isSavingEdit} type="submit">
                    {isSavingEdit ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setEditSubject(null)}>
                    Huỷ
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Tạo môn học mới</CardTitle>
          <CardDescription>Quản trị viên có thể thêm môn học và gán về bộ môn phụ trách.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateSubject} className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="subjectCode">Mã môn học</Label>
              <Input
                id="subjectCode"
                value={form.subjectCode}
                onChange={(event) => setForm((prev) => ({ ...prev, subjectCode: event.target.value }))}
                placeholder="VD: CNTT101"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="subjectName">Tên môn học</Label>
              <Input
                id="subjectName"
                value={form.subjectName}
                onChange={(event) => setForm((prev) => ({ ...prev, subjectName: event.target.value }))}
                placeholder="VD: Cấu trúc dữ liệu"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="credits">Số tín chỉ</Label>
              <Input
                id="credits"
                type="number"
                min={1}
                max={50}
                value={form.credits}
                onChange={(event) => setForm((prev) => ({ ...prev, credits: event.target.value }))}
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="departmentId">Bộ môn / Khoa</Label>
              <select
                id="departmentId"
                value={form.departmentId}
                onChange={(event) => setForm((prev) => ({ ...prev, departmentId: event.target.value }))}
                className="h-8 rounded-lg border border-input bg-background px-2.5 text-sm"
                required
              >
                <option value="" disabled>
                  Chọn bộ môn
                </option>
                {departments.map((department) => (
                  <option key={department.id} value={department.id}>
                    {department.code} - {department.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2 md:col-span-2">
              <Label htmlFor="description">Mô tả (tuỳ chọn)</Label>
              <Input
                id="description"
                value={form.description}
                onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                placeholder="Mô tả ngắn cho môn học"
              />
            </div>

            <div className="md:col-span-2">
              <Button disabled={isSubmitting} type="submit">
                {isSubmitting ? 'Đang tạo môn học...' : 'Tạo môn học'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách môn học</CardTitle>
          <CardDescription>Hiển thị các môn học đang hoạt động trong hệ thống.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="max-w-sm">
            <Input
              placeholder="Tìm theo mã, tên môn hoặc bộ môn..."
              value={searchKeyword}
              onChange={(event) => setSearchKeyword(event.target.value)}
            />
          </div>

          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full min-w-[960px] text-left text-sm">
              <thead className="bg-muted/60 text-muted-foreground">
                <tr>
                  <th className="px-3 py-2">Mã môn</th>
                  <th className="px-3 py-2">Tên môn học</th>
                  <th className="px-3 py-2">Tín chỉ</th>
                  <th className="px-3 py-2">Bộ môn</th>
                  <th className="px-3 py-2">Mô tả</th>
                  <th className="px-3 py-2 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-3 py-6 text-center text-muted-foreground">
                      Đang tải dữ liệu...
                    </td>
                  </tr>
                ) : filteredSubjects.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-3 py-6 text-center text-muted-foreground">
                      Không có môn học phù hợp.
                    </td>
                  </tr>
                ) : (
                  filteredSubjects.map((subject) => (
                    <tr key={subject.id} className="border-t align-top">
                      <td className="px-3 py-2 font-medium">{subject.subjectCode}</td>
                      <td className="px-3 py-2">{subject.subjectName}</td>
                      <td className="px-3 py-2">{subject.credits}</td>
                      <td className="px-3 py-2">
                        {subject.department.code} - {subject.department.name}
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">{subject.description || '-'}</td>
                      <td className="px-3 py-2 text-right">
                        <div className="flex flex-wrap justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={() => setDetailSubjectId(subject.id)}>
                            Chi tiết
                          </Button>
                          <Button size="sm" variant="secondary" onClick={() => openEdit(subject)}>
                            Sửa
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={deletingSubjectId === subject.id}
                            onClick={() => handleDeleteSubject(subject)}
                          >
                            {deletingSubjectId === subject.id ? 'Đang xoá...' : 'Xoá'}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
