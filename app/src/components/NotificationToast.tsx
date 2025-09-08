"use client";

import "react-toastify/dist/ReactToastify.css";
import { toast, ToastContainer, Zoom } from "react-toastify/unstyled";

export function NotificationToast() {
  return (
    <ToastContainer
      position="top-right"
      newestOnTop={true}
      closeOnClick
      pauseOnHover
      limit={3}
      theme="colored"
      transition={Zoom}
      autoClose={5000}
    />
  );
}

// helper functions
export const notifySuccess = (message: string) => toast.success(message);
export const notifyWarning = (message: string) => toast.warning(message);
export const notifyError = (message: string) => toast.error(message);
export const notifyInfo = (message: string) => toast.info(message);
