import { useCallback } from 'react';
import { useApp } from '../app/AppContext';

export function useClipboard() {
  const { showToast } = useApp();

  const copyToClipboard = useCallback(
    async (text: string, successMessage = 'Copied to clipboard') => {
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(text);
          showToast(successMessage, 'success');
        } else {
          // Fallback for non-secure contexts
          const textarea = document.createElement('textarea');
          textarea.value = text;
          textarea.style.position = 'fixed';
          textarea.style.opacity = '0';
          document.body.appendChild(textarea);
          textarea.focus();
          textarea.select();
          const success = document.execCommand('copy');
          document.body.removeChild(textarea);
          if (success) {
            showToast(successMessage, 'success');
          } else {
            showToast('Could not copy. Please copy manually.', 'error');
          }
        }
      } catch {
        showToast('Could not copy to clipboard.', 'error');
      }
    },
    [showToast],
  );

  return { copyToClipboard };
}
