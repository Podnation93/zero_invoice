import { useEffect, useState } from 'react';

export function useUnsavedChanges(hasUnsavedChanges: boolean) {
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  const confirmNavigation = (callback: () => void) => {
    if (hasUnsavedChanges) {
      setShowWarning(true);
      return false;
    }
    callback();
    return true;
  };

  const handleConfirm = (callback: () => void) => {
    setShowWarning(false);
    callback();
  };

  const handleCancel = () => {
    setShowWarning(false);
  };

  return {
    showWarning,
    confirmNavigation,
    handleConfirm,
    handleCancel,
  };
}
