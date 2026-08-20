import { ArrowLeft } from 'lucide-react';
import LanguageSwitcher from '../components/LanguageSwitcher';
import SpreadCards from '../components/SpreadCards';

function MessagesPage({
  theme,
  t,
  intlLocale,
  onBack,
  user,
  officialReaderId,
  mailboxItems,
  selectedMailboxItem,
  systemNotifications,
  unreadCount,
  getMailboxStatusLabel,
  getMailboxStatusHint,
  handleOpenMailboxItem,
  handleClaimSystemNotification,
  getSpreadConfig,
  adminRejectReason,
  setAdminRejectReason,
  adminInitialReply,
  setAdminInitialReply,
  adminFollowUpReply,
  setAdminFollowUpReply,
  userFollowUpAsk,
  setUserFollowUpAsk,
  handleAdminReject,
  handleAdminReply,
  handleAdminFollowUpReply,
  handleUserFeedback,
  handleUserFollowUp,
}) {
  return (
    <div className={`screen-shell page-shell theme-${theme}`}>
      <header className="page-header">
        <button type="button" onClick={onBack} className="icon-button">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="page-title">{t('mailbox.pageTitle')}</h1>
        <div className="page-header-controls">
          <LanguageSwitcher />
        </div>
      </header>

      <main className="page-content">
        <div className="mailbox-layout">
          <section className="question-panel mailbox-list-panel">
            <p className="eyebrow">{user?.id === officialReaderId ? t('mailbox.adminEyebrow') : t('mailbox.userEyebrow')}</p>
            <h2 className="question-title">{user?.id === officialReaderId ? t('mailbox.adminTitle') : t('mailbox.userTitle')}</h2>
            <p className="question-note">
              {user?.id === officialReaderId
                ? t('mailbox.adminNote')
                : unreadCount > 0
                  ? t('mailbox.userUnreadNote', { count: unreadCount })
                  : t('mailbox.userEmptyNote')}
            </p>

            {user?.id !== officialReaderId && systemNotifications.length > 0 ? (
              <div className="system-notification-list">
                {systemNotifications.map((notification) => (
                  <article key={notification.id} className="system-notification-card">
                    <div className="mailbox-item-head">
                      <strong>{notification.title || t('common.systemMessage')}</strong>
                      <span>{notification.status === 'claimed' ? t('mailbox.systemStatus.claimed') : t('mailbox.systemStatus.pending')}</span>
                    </div>
                    <p className="mailbox-item-question">{notification.body}</p>
                    <div className="mailbox-action-row">
                      <span className="mailbox-item-hint">
                        {notification.status === 'claimed'
                          ? t('mailbox.systemClaimedHint', { coins: notification.reward_coins || 99 })
                          : t('mailbox.systemPendingHint', { coins: notification.reward_coins || 99 })}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleClaimSystemNotification(notification)}
                        className={notification.status === 'claimed' ? 'secondary-button' : 'primary-button'}
                      >
                        {notification.status === 'claimed' ? t('mailbox.claimedSubsidy') : t('mailbox.claimSubsidy')}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ) : null}

            <div className="mailbox-item-list">
              {mailboxItems.length > 0 ? (
                mailboxItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`mailbox-item-card ${selectedMailboxItem?.id === item.id ? 'mailbox-item-card-active' : ''}`}
                    onClick={() => handleOpenMailboxItem(item)}
                  >
                    <div className="mailbox-item-head">
                      <strong>{getMailboxStatusLabel(item.status)}</strong>
                      <span>{new Date(item.created_at).toLocaleString(intlLocale)}</span>
                    </div>
                    {user?.id === officialReaderId ? (
                      <p className="mailbox-item-hint">{t('mailbox.fromLabel', { name: item.sender_nickname || t('common.unknownUser') })}</p>
                    ) : null}
                    <p className="mailbox-item-question">{item.initial_question || t('mailbox.noQuestion')}</p>
                    <p className="mailbox-item-hint">{getMailboxStatusHint(item.status)}</p>
                  </button>
                ))
              ) : (
                <div className="mailbox-empty">
                  <p className="mailbox-empty-title">{t('mailbox.emptyTitle')}</p>
                  <p className="mailbox-empty-copy">
                    {user?.id === officialReaderId ? t('mailbox.adminEmptyCopy') : t('mailbox.userEmptyCopy')}
                  </p>
                </div>
              )}
            </div>
          </section>

          <section className="question-panel mailbox-detail-panel">
            {selectedMailboxItem ? (
              <>
                <p className="eyebrow">{user?.id === officialReaderId ? t('mailbox.detailEyebrowAdmin') : t('mailbox.detailEyebrowUser')}</p>
                <h2 className="question-title">{getMailboxStatusLabel(selectedMailboxItem.status)}</h2>
                <p className="question-note">{getMailboxStatusHint(selectedMailboxItem.status)}</p>

                {user?.id === officialReaderId ? (
                  <div className="mailbox-detail-block">
                    <span className="mailbox-detail-label">{t('mailbox.senderLabel')}</span>
                    <p className="mailbox-detail-text">{selectedMailboxItem.sender_nickname || t('common.unknownUser')}</p>
                  </div>
                ) : null}

                <div className="mailbox-detail-block">
                  <span className="mailbox-detail-label">{t('mailbox.initialQuestionLabel')}</span>
                  <p className="mailbox-detail-text">{selectedMailboxItem.initial_question || t('common.emptyContent')}</p>
                </div>

                {selectedMailboxItem.record_snapshot?.cardsData?.length ? (
                  <div className="mailbox-detail-block">
                    <span className="mailbox-detail-label">{t('mailbox.spreadLabel')}</span>
                    <p className="mailbox-detail-text">
                      {selectedMailboxItem.record_snapshot.spreadName || getSpreadConfig(selectedMailboxItem.record_snapshot.spreadKey || 'three').name}
                    </p>
                    <SpreadCards
                      cards={selectedMailboxItem.record_snapshot.cardsData}
                      spread={getSpreadConfig(selectedMailboxItem.record_snapshot.spreadKey || 'three')}
                      isRevealed
                      className="history-preview-spread mailbox-detail-spread"
                      t={t}
                    />
                  </div>
                ) : null}

                {selectedMailboxItem.reject_reason ? (
                  <div className="mailbox-detail-block">
                    <span className="mailbox-detail-label">{t('mailbox.rejectReasonLabel')}</span>
                    <p className="mailbox-detail-text">{selectedMailboxItem.reject_reason}</p>
                  </div>
                ) : null}

                {selectedMailboxItem.initial_reply ? (
                  <div className="mailbox-detail-block">
                    <span className="mailbox-detail-label">{t('mailbox.initialReplyLabel')}</span>
                    <p className="mailbox-detail-text">{selectedMailboxItem.initial_reply}</p>
                  </div>
                ) : null}

                {selectedMailboxItem.follow_up_ask ? (
                  <div className="mailbox-detail-block">
                    <span className="mailbox-detail-label">{t('mailbox.followUpAskLabel')}</span>
                    <p className="mailbox-detail-text">{selectedMailboxItem.follow_up_ask}</p>
                  </div>
                ) : null}

                {selectedMailboxItem.follow_up_reply ? (
                  <div className="mailbox-detail-block">
                    <span className="mailbox-detail-label">{t('mailbox.followUpReplyLabel')}</span>
                    <p className="mailbox-detail-text">{selectedMailboxItem.follow_up_reply}</p>
                  </div>
                ) : null}

                {selectedMailboxItem.feedback ? (
                  <div className="mailbox-detail-block">
                    <span className="mailbox-detail-label">{t('mailbox.feedbackLabel')}</span>
                    <p className="mailbox-detail-text">{selectedMailboxItem.feedback === 'Heart' ? t('mailbox.heartLabel') : t('mailbox.spadeLabel')}</p>
                  </div>
                ) : null}

                {user?.id === officialReaderId ? (
                  <div className="mailbox-admin-actions">
                    {(selectedMailboxItem.status === 'pending' || selectedMailboxItem.status === 'read') ? (
                      <>
                        <label className="mailbox-field">
                          <span className="mailbox-detail-label">{t('mailbox.rejectReasonLabel')}</span>
                          <textarea
                            value={adminRejectReason}
                            onChange={(event) => setAdminRejectReason(event.target.value)}
                            placeholder={t('mailbox.rejectReasonPlaceholder')}
                            className="chat-input mailbox-textarea"
                            rows={4}
                          />
                        </label>

                        <label className="mailbox-field">
                          <div className="mailbox-field-head">
                            <span className="mailbox-detail-label">{t('mailbox.initialReplyLabel')}</span>
                            <span className="mailbox-char-count">{adminInitialReply.length}/1000</span>
                          </div>
                          <textarea
                            value={adminInitialReply}
                            onChange={(event) => setAdminInitialReply(event.target.value.slice(0, 1000))}
                            placeholder={t('mailbox.initialReplyPlaceholder')}
                            className="chat-input mailbox-textarea"
                            rows={8}
                          />
                        </label>

                        <div className="mailbox-action-row">
                          <button type="button" onClick={handleAdminReject} className="secondary-button">
                            {t('mailbox.rejectAndRefund')}
                          </button>
                          <button type="button" onClick={handleAdminReply} className="primary-button">
                            {t('mailbox.sendInitialReply')}
                          </button>
                        </div>
                      </>
                    ) : null}

                    {selectedMailboxItem.status === 'follow_up' ? (
                      <>
                        <label className="mailbox-field">
                          <div className="mailbox-field-head">
                            <span className="mailbox-detail-label">{t('mailbox.followUpReplyLabel')}</span>
                            <span className="mailbox-char-count">{adminFollowUpReply.length}/1000</span>
                          </div>
                          <textarea
                            value={adminFollowUpReply}
                            onChange={(event) => setAdminFollowUpReply(event.target.value.slice(0, 1000))}
                            placeholder={t('mailbox.followUpReplyPlaceholder')}
                            className="chat-input mailbox-textarea"
                            rows={8}
                          />
                        </label>

                        <div className="mailbox-action-row">
                          <button type="button" onClick={handleAdminFollowUpReply} className="primary-button">
                            {t('mailbox.sendFollowUpReply')}
                          </button>
                        </div>
                      </>
                    ) : null}
                  </div>
                ) : selectedMailboxItem.status === 'replied' ? (
                  <div className="mailbox-user-actions">
                    <label className="mailbox-field">
                      <div className="mailbox-field-head">
                        <span className="mailbox-detail-label">{t('mailbox.followUpAskLabel')}</span>
                        <span className="mailbox-char-count">{userFollowUpAsk.length}/100</span>
                      </div>
                      <p className="mailbox-detail-text">
                        {t('mailbox.followUpAskHint')}
                      </p>
                      <textarea
                        value={userFollowUpAsk}
                        onChange={(event) => setUserFollowUpAsk(event.target.value.slice(0, 100))}
                        placeholder={t('mailbox.followUpAskPlaceholder')}
                        className="chat-input mailbox-textarea mailbox-textarea-short"
                        rows={4}
                      />
                    </label>

                    <div className="mailbox-detail-block">
                      <span className="mailbox-detail-label">{t('mailbox.feedbackPrompt')}</span>
                    </div>

                    <div className="mailbox-action-row">
                      <button type="button" onClick={() => handleUserFeedback('Heart')} className="secondary-button">
                        {t('mailbox.satisfied')}
                      </button>
                      <button type="button" onClick={() => handleUserFeedback('Spade')} className="secondary-button">
                        {t('mailbox.dissatisfied')}
                      </button>
                      <button type="button" onClick={handleUserFollowUp} className="primary-button">
                        {t('mailbox.sendFollowUp')}
                      </button>
                    </div>
                  </div>
                ) : null}
              </>
            ) : (
              <div className="mailbox-empty mailbox-empty-detail">
                <p className="mailbox-empty-title">{t('mailbox.openFirstTitle')}</p>
                <p className="mailbox-empty-copy">
                  {user?.id === officialReaderId ? t('mailbox.pendingOpenHintAdmin') : t('mailbox.pendingOpenHintUser')}
                </p>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default MessagesPage;
