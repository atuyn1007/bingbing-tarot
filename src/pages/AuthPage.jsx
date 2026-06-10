import { LazyMotion, domAnimation, m } from 'framer-motion';
import { Lock, Mail, User } from 'lucide-react';
import LanguageSwitcher from '../components/LanguageSwitcher';
import ThemeToggle from '../components/ThemeToggle';

function AuthPage({
  theme,
  onThemeChange,
  isRecoveryMode,
  isSessionSyncing,
  hasAuthDraft,
  isLogin,
  emailInputRef,
  passwordInputRef,
  email,
  setEmail,
  nickname,
  setNickname,
  password,
  setPassword,
  resetPasswordValue,
  setResetPasswordValue,
  setIsSessionSyncing,
  setShowForgotPasswordModal,
  setIsRecoveryMode,
  setIsLogin,
  setShowForgotPasswordModalState,
  syncAuthInputValues,
  autofillSyncTimeoutRef,
  authInteractionRef,
  handleCompletePasswordReset,
  handleLogin,
  handleRegister,
  t,
}) {
  return (
    <div className={`screen-shell auth-screen theme-${theme}`}>
      <div className="orb orb-left" />
      <div className="orb orb-right" />
      <LazyMotion features={domAnimation}>
        <m.div className="auth-card" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="auth-toggles">
            <LanguageSwitcher />
            <ThemeToggle theme={theme} onChange={onThemeChange} t={t} extraClassName="auth-theme-toggle" />
          </div>
          <h1 className="hero-title">bingbing&apos;s tarot</h1>
          <p className="hero-subtitle">
            {isRecoveryMode
              ? t('auth.recoverySubtitle')
              : isSessionSyncing && !hasAuthDraft
                ? t('auth.syncingSubtitle')
                : isLogin
                  ? t('auth.loginSubtitle')
                  : t('auth.registerSubtitle')}
          </p>

          <div className="auth-form">
            <label className="field-shell">
              <Mail className="field-icon" />
              <input
                ref={emailInputRef}
                type="email"
                value={email}
                onChange={(event) => {
                  authInteractionRef.current = true;
                  setEmail(event.target.value);
                  if (isSessionSyncing) setIsSessionSyncing(false);
                }}
                onInput={() => {
                  if (autofillSyncTimeoutRef.current) clearTimeout(autofillSyncTimeoutRef.current);
                  if (isSessionSyncing) setIsSessionSyncing(false);
                  autofillSyncTimeoutRef.current = setTimeout(syncAuthInputValues, 0);
                }}
                onFocus={() => {
                  authInteractionRef.current = true;
                  if (isSessionSyncing) setIsSessionSyncing(false);
                }}
                placeholder={t('auth.emailPlaceholder')}
                className="field-input"
              />
            </label>

            {!isLogin && !isRecoveryMode ? (
              <label className="field-shell">
                <User className="field-icon" />
                <input type="text" value={nickname} onChange={(event) => setNickname(event.target.value)} placeholder={t('auth.nicknamePlaceholder')} className="field-input" />
              </label>
            ) : null}

            <label className="field-shell">
              <Lock className="field-icon" />
              <input
                ref={passwordInputRef}
                type="password"
                value={isRecoveryMode ? resetPasswordValue : password}
                onChange={(event) => {
                  authInteractionRef.current = true;
                  if (isRecoveryMode) {
                    setResetPasswordValue(event.target.value);
                  } else {
                    setPassword(event.target.value);
                  }
                  if (isSessionSyncing) setIsSessionSyncing(false);
                }}
                onInput={() => {
                  if (autofillSyncTimeoutRef.current) clearTimeout(autofillSyncTimeoutRef.current);
                  if (isSessionSyncing) setIsSessionSyncing(false);
                  autofillSyncTimeoutRef.current = setTimeout(syncAuthInputValues, 0);
                }}
                onFocus={() => {
                  authInteractionRef.current = true;
                  if (isSessionSyncing) setIsSessionSyncing(false);
                }}
                placeholder={isRecoveryMode ? t('auth.newPasswordPlaceholder') : t('auth.passwordPlaceholder')}
                className="field-input"
                onKeyDown={(event) =>
                  event.key === 'Enter' &&
                  (isRecoveryMode ? handleCompletePasswordReset() : isLogin ? handleLogin() : handleRegister())
                }
              />
            </label>

            <button
              type="button"
              onClick={isRecoveryMode ? handleCompletePasswordReset : isLogin ? handleLogin : handleRegister}
              className="primary-button"
            >
              {isRecoveryMode ? t('auth.updatePasswordButton') : isLogin ? t('auth.loginButton') : t('auth.registerButton')}
            </button>

            {isLogin && !isRecoveryMode ? (
              <button type="button" onClick={() => setShowForgotPasswordModal(true)} className="text-button forgot-password-link">
                {t('auth.forgotPasswordLink')}
              </button>
            ) : null}

            {isRecoveryMode ? (
              <p className="switch-text">
                {t('auth.recoverySubtitle')}
                <span
                  onClick={() => {
                    setIsRecoveryMode(false);
                    setResetPasswordValue('');
                    setPassword('');
                  }}
                  className="switch-link"
                >
                  {t('auth.backToLogin')}
                </span>
              </p>
            ) : (
              <p className="switch-text">
                {isLogin ? t('auth.noAccount') : t('auth.hasAccount')}
                <span
                  onClick={() => {
                    setIsLogin((current) => !current);
                    setEmail('');
                    setNickname('');
                    setPassword('');
                    setResetPasswordValue('');
                    setShowForgotPasswordModalState(false);
                  }}
                  className="switch-link"
                >
                  {isLogin ? t('auth.goRegister') : t('auth.goLogin')}
                </span>
              </p>
            )}
          </div>
        </m.div>
      </LazyMotion>
    </div>
  );
}

export default AuthPage;
