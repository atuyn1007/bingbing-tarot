import { LazyMotion, domAnimation, m } from 'framer-motion';
import { ArrowLeft, Send } from 'lucide-react';
import LanguageSwitcher from '../components/LanguageSwitcher';

function ChatPage({
  theme,
  t,
  onBack,
  userQuestion,
  drawnCards,
  messages,
  isWaitingForReply,
  messageText,
  setMessageText,
  handleSendMessage,
}) {
  return (
    <div className={`screen-shell page-shell theme-${theme}`}>
      <header className="page-header">
        <button type="button" onClick={onBack} className="icon-button">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="page-title">{t('chat.title')}</h1>
        <div className="page-header-controls">
          <LanguageSwitcher />
        </div>
      </header>

      <main className="chat-layout">
        <section className="chat-summary">
          <p className="eyebrow">{t('drawing.questionEyebrow')}</p>
          <p className="chat-question">{`"${userQuestion}"`}</p>
          <div className="chat-cards">
            {drawnCards.map((card, index) => (
              <div key={index} className="chat-card-pill">
                <span>{card.name}</span>
                {card.isReversed && <small>{t('common.orientationReversed')}</small>}
              </div>
            ))}
          </div>
        </section>

        <section className="chat-thread">
          <LazyMotion features={domAnimation}>
            {messages.map((message) => (
              <m.div key={message.id} className={`message-row ${message.sender === 'user' ? 'message-row-user' : ''}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <div className={`message-bubble ${message.sender === 'user' ? 'message-bubble-user' : ''}`}>{message.text}</div>
              </m.div>
            ))}
          </LazyMotion>

          {isWaitingForReply && messages.length === 0 && <p className="chat-waiting">{t('chat.waiting')}</p>}
        </section>
      </main>

      <footer className="chat-footer">
        <input
          type="text"
          value={messageText}
          onChange={(event) => setMessageText(event.target.value)}
          placeholder={t('chat.placeholder')}
          className="chat-input"
          onKeyDown={(event) => event.key === 'Enter' && handleSendMessage()}
        />
        <button type="button" onClick={handleSendMessage} className="icon-button dark-icon-button">
          <Send className="w-5 h-5" />
        </button>
      </footer>
    </div>
  );
}

export default ChatPage;
