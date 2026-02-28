import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { hideErrorToast } from '../../store/slice/ui.slice';

const AUTO_HIDE_MS = 3200;

export function ErrorToast() {
  const dispatch = useDispatch();
  const toast = useSelector((state: RootState) => state.ui.errorToast);

  useEffect(() => {
    if (!toast.visible) return;

    const timer = setTimeout(() => {
      dispatch(hideErrorToast());
    }, AUTO_HIDE_MS);

    return () => clearTimeout(timer);
  }, [dispatch, toast.id, toast.visible]);

  if (!toast.visible || !toast.message) return null;

  return (
    <View pointerEvents="none" style={styles.host}>
      <View
        style={[
          styles.toast,
          toast.level === 'warning' ? styles.toastWarning : styles.toastError,
        ]}
      >
        <Text numberOfLines={2} style={styles.text}>
          {toast.message}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    zIndex: 9999,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  toast: {
    maxWidth: 700,
    width: '100%',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
  },
  toastError: {
    backgroundColor: '#b91c1c',
    borderColor: '#ef4444',
  },
  toastWarning: {
    backgroundColor: '#92400e',
    borderColor: '#f59e0b',
  },
  text: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});
