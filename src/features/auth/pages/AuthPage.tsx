import { useEffect, useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, Info, Loader2 } from 'lucide-react';
import AuthFormField from '../components/AuthFormField';
import { authService, authValidators } from '../services/authService';
import { useAuth } from '../hooks/useAuth';

interface AuthPageProps {
  defaultTab?: 'login' | 'register';
}

export function AuthPage({ defaultTab = 'login' }: AuthPageProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const [selectedMobileTab, setSelectedMobileTab] = useState<{
    routeKey: string;
    tab: 'login' | 'register';
  }>({
    routeKey: location.pathname,
    tab: defaultTab,
  });

  const mobileTab =
    selectedMobileTab.routeKey === location.pathname
      ? selectedMobileTab.tab
      : defaultTab;

  const setMobileTab = (tab: 'login' | 'register') => {
    setSelectedMobileTab({ routeKey: location.pathname, tab });
  };

  // Login State
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loginErrors, setLoginErrors] = useState<{
    identifier?: string;
    password?: string;
    form?: string;
  }>({});
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Register State
  const [regFullName, setRegFullName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regErrors, setRegErrors] = useState<{
    fullName?: string;
    username?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    phone?: string;
    form?: string;
  }>({});
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerSuccessMessage, setRegisterSuccessMessage] = useState<string | null>(null);

  const redirectPath =
    (location.state as { from?: string } | null)?.from || '/';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, navigate, redirectPath]);

  const handleLoginSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const identifierError = authValidators.required(
      loginIdentifier,
      'Vui lòng nhập tên đăng nhập hoặc email.'
    );
    const passwordError = authValidators.required(
      loginPassword,
      'Vui lòng nhập mật khẩu.'
    );

    if (identifierError || passwordError) {
      setLoginErrors({
        identifier: identifierError ?? undefined,
        password: passwordError ?? undefined,
      });
      return;
    }

    setLoginErrors({});
    setIsLoggingIn(true);

    try {
      const response = await authService.login({
        identifier: loginIdentifier,
        password: loginPassword,
        rememberMe,
      });

      if (!response.success) {
        setLoginErrors({ form: response.message });
        return;
      }

      navigate(redirectPath, { replace: true });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleRegisterSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setRegisterSuccessMessage(null);

    const fullNameError = authValidators.required(
      regFullName,
      'Vui lòng nhập họ và tên.'
    );
    const usernameError = authValidators.username(regUsername);
    const emailError = authValidators.email(regEmail);
    const passwordError = authValidators.passwordStrength(regPassword);
    const confirmPasswordError =
      !regConfirmPassword.trim()
        ? 'Vui lòng nhập lại mật khẩu.'
        : regConfirmPassword !== regPassword
          ? 'Mật khẩu xác nhận không khớp.'
          : null;
    const phoneError = authValidators.phone(regPhone);

    if (
      fullNameError ||
      usernameError ||
      emailError ||
      passwordError ||
      confirmPasswordError ||
      phoneError
    ) {
      setRegErrors({
        fullName: fullNameError ?? undefined,
        username: usernameError ?? undefined,
        email: emailError ?? undefined,
        password: passwordError ?? undefined,
        confirmPassword: confirmPasswordError ?? undefined,
        phone: phoneError ?? undefined,
      });
      return;
    }

    setRegErrors({});
    setIsRegistering(true);

    try {
      const response = await authService.register({
        fullName: regFullName,
        username: regUsername,
        email: regEmail,
        password: regPassword,
        confirmPassword: regConfirmPassword,
        phone: regPhone,
      });

      if (!response.success) {
        setRegErrors({ form: response.message });
        return;
      }

      setRegisterSuccessMessage(response.message);
      setLoginIdentifier(regUsername.trim());
      setLoginPassword('');
      setRegPassword('');
      setRegConfirmPassword('');
      setMobileTab('login');
    } finally {
      setIsRegistering(false);
    }
  };

  const fillDemoAccount = (identifier: string) => {
    setLoginIdentifier(identifier);
    setLoginPassword('English123');
    setLoginErrors({});
  };

  return (
    <div className="ec-reading-font bg-[#F5FAFE] py-8 md:py-12">
      <div className="mx-auto max-w-[1080px] px-4 sm:px-6">
        {/* Mobile Tab Switcher */}
        <div className="mb-5 grid grid-cols-2 gap-1.5 rounded-[12px] border border-[#DCEAF3] bg-white p-1.5 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileTab('login')}
            className={`rounded-[8px] py-2.5 text-[14px] font-semibold transition-all ${
              mobileTab === 'login'
                ? 'bg-[#EAF6FD] text-[#2878B8]'
                : 'text-[#718096] hover:text-[#243B53]'
            }`}
          >
            Đăng nhập
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('register')}
            className={`rounded-[8px] py-2.5 text-[14px] font-semibold transition-all ${
              mobileTab === 'register'
                ? 'bg-[#EAF6FD] text-[#2878B8]'
                : 'text-[#718096] hover:text-[#243B53]'
            }`}
          >
            Đăng ký
          </button>
        </div>

        {/* Desktop 2-column Grid: 5fr (Login) - 7fr (Register) */}
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[5fr_7fr]">
          {/* LEFT CARD: ĐĂNG NHẬP */}
          <section
            aria-label="Đăng nhập tài khoản học viên"
            className={`${
              mobileTab === 'login' ? 'block' : 'hidden lg:block'
            } rounded-[18px] border border-[#DCEAF3] bg-white p-6 shadow-[0_8px_24px_rgba(36,59,83,0.06)] sm:p-7`}
          >
            <div className="mb-5">
              <h1 className="text-[22px] font-bold tracking-[-0.02em] text-[#243B53]">
                Đăng nhập
              </h1>
              <p className="mt-1 text-[13.5px] text-[#718096]">
                Chào mừng bạn quay lại hệ thống học tập English Center.
              </p>
            </div>

            {registerSuccessMessage ? (
              <div className="mb-4 flex items-start gap-2.5 rounded-[10px] border border-[#A7F3D0] bg-[#ECFDF5] p-3.5 text-[13px] text-[#065F46]">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#059669]" />
                <span>{registerSuccessMessage}</span>
              </div>
            ) : null}

            {loginErrors.form ? (
              <div className="mb-4 rounded-[10px] border border-[#FECACA] bg-[#FEF2F2] p-3 text-[13px] font-medium text-[#DC2626]">
                {loginErrors.form}
              </div>
            ) : null}

            <form onSubmit={handleLoginSubmit} noValidate className="space-y-4">
              <AuthFormField
                id="login-identifier"
                label="Tên đăng nhập hoặc Email"
                autoComplete="username"
                placeholder="Nhập tên đăng nhập hoặc email"
                value={loginIdentifier}
                onChange={(val) => {
                  setLoginIdentifier(val);
                  if (loginErrors.identifier || loginErrors.form) {
                    setLoginErrors((prev) => ({
                      ...prev,
                      identifier: undefined,
                      form: undefined,
                    }));
                  }
                }}
                error={loginErrors.identifier}
              />

              <AuthFormField
                id="login-password"
                type="password"
                label="Mật khẩu"
                autoComplete="current-password"
                placeholder="Nhập mật khẩu"
                value={loginPassword}
                onChange={(val) => {
                  setLoginPassword(val);
                  if (loginErrors.password || loginErrors.form) {
                    setLoginErrors((prev) => ({
                      ...prev,
                      password: undefined,
                      form: undefined,
                    }));
                  }
                }}
                error={loginErrors.password}
              />

              <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
                <label className="inline-flex cursor-pointer items-center gap-2 text-[13px] text-[#718096] select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) => setRememberMe(event.target.checked)}
                    className="h-4 w-4 rounded border-[#DCEAF3] accent-[#2878B8]"
                  />
                  <span>Ghi nhớ đăng nhập</span>
                </label>

                <Link
                  to="/forgot-password"
                  className="text-[13px] font-semibold text-[#2878B8] transition-colors hover:underline"
                >
                  Quên mật khẩu?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="inline-flex h-[42px] w-full items-center justify-center gap-2 rounded-[10px] bg-[#2878B8] px-4 text-[14px] font-semibold text-white transition-all hover:bg-[#1f639a] disabled:cursor-not-allowed disabled:opacity-65"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Đang đăng nhập...</span>
                  </>
                ) : (
                  <span>Đăng nhập</span>
                )}
              </button>
            </form>

            {/* Quick Demo Student Accounts */}
            <div className="mt-5 rounded-[12px] border border-[#DCEAF3] bg-[#F5FAFE] p-3.5">
              <div className="flex items-center gap-1.5 text-[12px] font-semibold text-[#243B53]">
                <Info className="h-3.5 w-3.5 text-[#2878B8]" />
                <span>Tài khoản học viên mẫu (Mock Data):</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => fillDemoAccount('hocvien01')}
                  className="rounded-[8px] border border-[#DCEAF3] bg-white px-2.5 py-1.5 text-[12px] font-medium text-[#243B53] transition-colors hover:border-[#75BDEB] hover:bg-[#EAF6FD] hover:text-[#2878B8]"
                >
                  Đỗ Như Đạt (hocvien01)
                </button>
                <button
                  type="button"
                  onClick={() => fillDemoAccount('minhanh.toeic')}
                  className="rounded-[8px] border border-[#DCEAF3] bg-white px-2.5 py-1.5 text-[12px] font-medium text-[#243B53] transition-colors hover:border-[#75BDEB] hover:bg-[#EAF6FD] hover:text-[#2878B8]"
                >
                  Nguyễn Minh Anh (minhanh.toeic)
                </button>
              </div>
            </div>
          </section>

          {/* RIGHT CARD: ĐĂNG KÝ */}
          <section
            aria-label="Đăng ký tài khoản học viên"
            className={`${
              mobileTab === 'register' ? 'block' : 'hidden lg:block'
            } rounded-[18px] border border-[#DCEAF3] bg-white p-6 shadow-[0_8px_24px_rgba(36,59,83,0.06)] sm:p-7`}
          >
            <div className="mb-5">
              <h2 className="text-[22px] font-bold tracking-[-0.02em] text-[#243B53]">
                Đăng ký
              </h2>
              <p className="mt-1 text-[13.5px] text-[#718096]">
                Tạo tài khoản học viên để lưu lịch sử làm bài và theo dõi khóa học.
              </p>
            </div>

            {regErrors.form ? (
              <div className="mb-4 rounded-[10px] border border-[#FECACA] bg-[#FEF2F2] p-3 text-[13px] font-medium text-[#DC2626]">
                {regErrors.form}
              </div>
            ) : null}

            <form onSubmit={handleRegisterSubmit} noValidate>
              <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                <AuthFormField
                  id="reg-fullname"
                  label="Họ và tên"
                  autoComplete="name"
                  placeholder="Nguyễn Văn A"
                  value={regFullName}
                  onChange={(val) => {
                    setRegFullName(val);
                    if (regErrors.fullName) {
                      setRegErrors((prev) => ({ ...prev, fullName: undefined }));
                    }
                  }}
                  error={regErrors.fullName}
                />

                <AuthFormField
                  id="reg-username"
                  label="Tên đăng nhập"
                  autoComplete="username"
                  placeholder="nguyenvana"
                  value={regUsername}
                  onChange={(val) => {
                    setRegUsername(val);
                    if (regErrors.username || regErrors.form) {
                      setRegErrors((prev) => ({
                        ...prev,
                        username: undefined,
                        form: undefined,
                      }));
                    }
                  }}
                  error={regErrors.username}
                />

                <AuthFormField
                  id="reg-email"
                  type="email"
                  label="Email"
                  autoComplete="email"
                  placeholder="email@example.com"
                  value={regEmail}
                  onChange={(val) => {
                    setRegEmail(val);
                    if (regErrors.email || regErrors.form) {
                      setRegErrors((prev) => ({
                        ...prev,
                        email: undefined,
                        form: undefined,
                      }));
                    }
                  }}
                  error={regErrors.email}
                />

                <AuthFormField
                  id="reg-password"
                  type="password"
                  label="Mật khẩu"
                  autoComplete="new-password"
                  placeholder="Tối thiểu 8 ký tự (chữ + số)"
                  value={regPassword}
                  onChange={(val) => {
                    setRegPassword(val);
                    if (regErrors.password) {
                      setRegErrors((prev) => ({ ...prev, password: undefined }));
                    }
                  }}
                  error={regErrors.password}
                />

                <AuthFormField
                  id="reg-confirm-password"
                  type="password"
                  label="Nhập lại mật khẩu"
                  autoComplete="new-password"
                  placeholder="Nhập lại mật khẩu"
                  value={regConfirmPassword}
                  onChange={(val) => {
                    setRegConfirmPassword(val);
                    if (regErrors.confirmPassword) {
                      setRegErrors((prev) => ({
                        ...prev,
                        confirmPassword: undefined,
                      }));
                    }
                  }}
                  error={regErrors.confirmPassword}
                />

                <AuthFormField
                  id="reg-phone"
                  type="tel"
                  label="Số điện thoại"
                  autoComplete="tel"
                  placeholder="09xxxxxxxx"
                  value={regPhone}
                  onChange={(val) => {
                    setRegPhone(val);
                    if (regErrors.phone) {
                      setRegErrors((prev) => ({ ...prev, phone: undefined }));
                    }
                  }}
                  error={regErrors.phone}
                />
              </div>

              <div className="mt-5">
                <button
                  type="submit"
                  disabled={isRegistering}
                  className="inline-flex h-[42px] w-full items-center justify-center gap-2 rounded-[10px] bg-[#2878B8] px-4 text-[14px] font-semibold text-white transition-all hover:bg-[#1f639a] disabled:cursor-not-allowed disabled:opacity-65"
                >
                  {isRegistering ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Đang tạo tài khoản...</span>
                    </>
                  ) : (
                    <span>Đăng ký tài khoản</span>
                  )}
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
