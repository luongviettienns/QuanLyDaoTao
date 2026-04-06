import { useMemo, useState } from 'react'
import {
  Alert,
  App as AntApp,
  Button,
  Card,
  Checkbox,
  ConfigProvider,
  Form,
  Input,
  Space,
  Typography,
} from 'antd'
import { GraduationCap, LockKeyhole, ShieldCheck, UserRound } from 'lucide-react'
import { login } from '../api/auth'
import type { LoginPayload, LoginResponse } from '../types/auth'

const { Title, Paragraph, Text } = Typography

type LoginPageProps = {
  user: LoginResponse | null
  onLoginSuccess: (user: LoginResponse, rememberMe: boolean) => void
}

type LoginFormValues = LoginPayload & {
  rememberMe?: boolean
}

const heroStats = [
  { label: 'Cong thong tin tap trung', value: '01' },
  { label: 'Nhom nguoi dung', value: '04' },
  { label: 'San sang ket noi gateway', value: '24/7' },
]

export function LoginPage({ user, onLoginSuccess }: LoginPageProps) {
  const [form] = Form.useForm<LoginFormValues>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const { message } = AntApp.useApp()

  const initialValues = useMemo<LoginFormValues>(
    () => ({
      username: '',
      password: '',
      rememberMe: true,
    }),
    [],
  )

  const handleSubmit = async (values: LoginFormValues) => {
    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      const response = await login({
        username: values.username.trim(),
        password: values.password,
      })

      onLoginSuccess(response, Boolean(values.rememberMe))
      message.success(`Chao mung ${response.fullName || response.username}`)
      form.setFieldValue('password', '')
    } catch (error) {
      const nextMessage =
        error instanceof Error ? error.message : 'Khong the dang nhap luc nay.'
      setErrorMessage(nextMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1f6feb',
          colorInfo: '#1f6feb',
          borderRadius: 18,
          fontFamily: '"Geist Variable", sans-serif',
        },
      }}
    >
      <div className="login-shell">
        <div className="login-backdrop login-backdrop-left" />
        <div className="login-backdrop login-backdrop-right" />

        <div className="mx-auto flex min-h-screen w-full max-w-7xl items-center px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid w-full gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <section className="login-hero">
              <div className="inline-flex w-fit items-center gap-3 rounded-full border border-white/50 bg-white/70 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm backdrop-blur">
                <GraduationCap className="h-4 w-4 text-blue-600" />
                He thong quan ly dao tao
              </div>

              <div className="max-w-2xl">
                <Title className="!mb-4 !font-serif !text-4xl !leading-tight !text-slate-900 sm:!text-5xl">
                  Dang nhap de quan ly hoc vu tren mot giao dien gon va ro rang.
                </Title>
                <Paragraph className="!mb-0 !max-w-xl !text-base !leading-7 !text-slate-600 sm:!text-lg">
                  Thiet ke tham chieu tu `frontend-demo`, giu lai cam giac hien dai,
                  nhung code duoc viet toi gian de de noi them dashboard, forgot
                  password va cac man hinh nghiep vu sau nay.
                </Paragraph>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {heroStats.map((item) => (
                  <div key={item.label} className="login-stat-card">
                    <Text className="login-stat-value">{item.value}</Text>
                    <Text className="login-stat-label">{item.label}</Text>
                  </div>
                ))}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="login-feature-card">
                  <ShieldCheck className="h-5 w-5 text-blue-600" />
                  <div>
                    <Text className="login-feature-title">Ket noi backend that</Text>
                    <Paragraph className="!mb-0 !mt-1 !text-sm !text-slate-600">
                      Form gui request den gateway `https://localhost:7033/api-edu/auth/login`.
                    </Paragraph>
                  </div>
                </div>

                <div className="login-feature-card">
                  <UserRound className="h-5 w-5 text-amber-600" />
                  <div>
                    <Text className="login-feature-title">Luu phien dang nhap</Text>
                    <Paragraph className="!mb-0 !mt-1 !text-sm !text-slate-600">
                      Co san logic luu `token`, `refreshToken` va thong tin nguoi dung vao storage.
                    </Paragraph>
                  </div>
                </div>
              </div>
            </section>

            <section className="flex items-center justify-center">
              <Card className="login-card w-full max-w-xl border-0">
                <Space direction="vertical" size={12} className="w-full">
                  <div className="flex items-center gap-4">
                    <div className="login-logo-wrap">
                      <GraduationCap className="h-8 w-8 text-blue-700" />
                    </div>
                    <div>
                      <Text className="block text-sm font-medium uppercase tracking-[0.24em] text-slate-500">
                        Education Management
                      </Text>
                      <Title level={3} className="!mb-0 !mt-1 !font-serif !text-slate-900">
                        Dang nhap he thong
                      </Title>
                    </div>
                  </div>

                  <Paragraph className="!mb-0 !text-slate-600">
                    Su dung tai khoan duoc cap boi quan tri vien de truy cap vao
                    cac chuc nang hoc vu.
                  </Paragraph>

                  {user ? (
                    <Alert
                      type="success"
                      showIcon
                      message={`Da dang nhap voi vai tro ${user.role}`}
                      description={`Xin chao ${user.fullName || user.username}. Token da duoc luu tren trinh duyet.`}
                    />
                  ) : null}

                  {errorMessage ? (
                    <Alert type="error" showIcon message={errorMessage} />
                  ) : null}

                  <Form<LoginFormValues>
                    form={form}
                    layout="vertical"
                    initialValues={initialValues}
                    onFinish={handleSubmit}
                    autoComplete="off"
                    requiredMark={false}
                    className="pt-2"
                  >
                    <Form.Item<LoginFormValues>
                      label="Ten dang nhap"
                      name="username"
                      rules={[{ required: true, message: 'Nhap ten dang nhap' }]}
                    >
                      <Input
                        size="large"
                        prefix={<UserRound className="h-4 w-4 text-slate-400" />}
                        placeholder="vd: admin"
                      />
                    </Form.Item>

                    <Form.Item<LoginFormValues>
                      label="Mat khau"
                      name="password"
                      rules={[{ required: true, message: 'Nhap mat khau' }]}
                    >
                      <Input.Password
                        size="large"
                        prefix={<LockKeyhole className="h-4 w-4 text-slate-400" />}
                        placeholder="Nhap mat khau"
                      />
                    </Form.Item>

                    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <Form.Item<LoginFormValues> name="rememberMe" valuePropName="checked" noStyle>
                        <Checkbox>Ghi nho dang nhap</Checkbox>
                      </Form.Item>

                      <Text className="text-sm text-slate-500">
                        Quen mat khau? Co the noi them man hinh OTP sau.
                      </Text>
                    </div>

                    <Button
                      type="primary"
                      htmlType="submit"
                      size="large"
                      block
                      loading={isSubmitting}
                      className="!h-12 !rounded-2xl !font-semibold"
                    >
                      Dang nhap
                    </Button>
                  </Form>
                </Space>
              </Card>
            </section>
          </div>
        </div>
      </div>
    </ConfigProvider>
  )
}
