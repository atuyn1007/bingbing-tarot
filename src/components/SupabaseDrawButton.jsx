import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { drawCardAndSave } from '../supabaseTarot';

function SupabaseDrawButton() {
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleDraw = async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const nextResult = await drawCardAndSave();
      setResult(nextResult);
    } catch (error) {
      setErrorMessage(error.message || '抽牌失败，请稍后再试。');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'grid',
        gap: '16px',
        width: '100%',
        maxWidth: '360px',
        margin: '0 auto',
      }}
    >
      <button
        type="button"
        onClick={handleDraw}
        disabled={isLoading}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          minHeight: '52px',
          padding: '0 20px',
          borderRadius: '999px',
          border: '1px solid rgba(34, 34, 34, 0.12)',
          background: isLoading ? '#d8cfc6' : '#2f241f',
          color: '#fffaf5',
          fontSize: '16px',
          cursor: isLoading ? 'wait' : 'pointer',
        }}
      >
        <Sparkles size={18} />
        <span>{isLoading ? '抽牌中...' : '抽一张牌并存入 Supabase'}</span>
      </button>

      {errorMessage ? (
        <div
          style={{
            padding: '14px 16px',
            borderRadius: '16px',
            border: '1px solid rgba(160, 64, 64, 0.18)',
            background: '#fff7f6',
            color: '#9b3d31',
          }}
        >
          {errorMessage}
        </div>
      ) : null}

      {result ? (
        <div
          style={{
            padding: '18px',
            borderRadius: '20px',
            border: '1px solid rgba(34, 34, 34, 0.08)',
            background: '#fffdf9',
            color: '#2f241f',
            textAlign: 'center',
          }}
        >
          <p style={{ margin: 0, fontSize: '13px', letterSpacing: '0.18em', color: '#8e7460' }}>
            DRAW RESULT
          </p>
          <p style={{ margin: '10px 0 6px', fontSize: '28px', lineHeight: 1.25 }}>
            {result.card_name}
          </p>
          <p style={{ margin: 0, fontSize: '16px', color: '#6e594a' }}>{result.position_label}</p>
        </div>
      ) : null}
    </div>
  );
}

export default SupabaseDrawButton;
