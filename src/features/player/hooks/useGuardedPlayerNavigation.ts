import { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList } from '../../../types/navigations';
import { AppDispatch } from '../../../store';
import { showErrorToast } from '../../../store/slice/ui.slice';
import { streamingApi, StreamPayload } from '../services/streaming.api';

type PlayerParams = RootStackParamList['Player'];
type NavProp = NativeStackNavigationProp<RootStackParamList>;

export function useGuardedPlayerNavigation(navigation: NavProp) {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const [isCheckingAccess, setIsCheckingAccess] = useState(false);
  const [subscriptionModalVisible, setSubscriptionModalVisible] =
    useState(false);

  const closeSubscriptionModal = useCallback(() => {
    setSubscriptionModalVisible(false);
  }, []);

  const openPlayerWithGuard = useCallback(
    async (params: PlayerParams) => {
      if (isCheckingAccess) return;
      setIsCheckingAccess(true);

      try {
        let preloadedStreamPayload: StreamPayload | undefined;

        if (params.movieId) {
          preloadedStreamPayload = await streamingApi.getMovieStream(
            params.movieId,
          );
        } else if (params.episodeId) {
          preloadedStreamPayload =
            await streamingApi.getEpisodeStream(params.episodeId);
        }

        navigation.navigate('Player', {
          ...params,
          preloadedStreamPayload,
        });
      } catch (error: any) {
        const status = Number(error?.status);
        if (status === 403) {
          setSubscriptionModalVisible(true);
          return;
        }

        const message =
          typeof error?.message === 'string' && error.message.trim()
            ? error.message.trim()
            : t('player.stream_unavailable');
        dispatch(showErrorToast(message));
      } finally {
        setIsCheckingAccess(false);
      }
    },
    [dispatch, isCheckingAccess, navigation, t],
  );

  return {
    isCheckingAccess,
    subscriptionModalVisible,
    openPlayerWithGuard,
    closeSubscriptionModal,
  };
}

