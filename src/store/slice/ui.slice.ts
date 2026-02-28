import { createSlice } from '@reduxjs/toolkit';

interface UiState {
  isSidebarOpen: boolean;
  errorToast: {
    visible: boolean;
    message: string;
    id: number;
    level: 'error' | 'warning';
  };
}

const initialState: UiState = {
  isSidebarOpen: false,
  errorToast: {
    visible: false,
    message: '',
    id: 0,
    level: 'error',
  },
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar(state) {
      state.isSidebarOpen = !state.isSidebarOpen;
    },
    setSidebar(state, action) {
      state.isSidebarOpen = action.payload;
    },
    showErrorToast(state, action) {
      state.errorToast.visible = true;
      state.errorToast.message = action.payload;
      state.errorToast.id = Date.now();
      state.errorToast.level = 'error';
    },
    showWarningToast(state, action) {
      state.errorToast.visible = true;
      state.errorToast.message = action.payload;
      state.errorToast.id = Date.now();
      state.errorToast.level = 'warning';
    },
    hideErrorToast(state) {
      state.errorToast.visible = false;
      state.errorToast.message = '';
    },
  },
});

export const {
  toggleSidebar,
  setSidebar,
  showErrorToast,
  showWarningToast,
  hideErrorToast,
} = uiSlice.actions;
export default uiSlice.reducer;
