import { create } from "zustand";

export const useStore = create((set) => ({
  imageFound: false,
  setImageFound: (data) => set({ imageFound: data }),
  wayspot: false,
  setWayspot: (data) => set({ wayspot: data }),
  placed: false,
  setPlaced: (data) => set({ placed: data }),
  placePosition: false,
  setPlacePosition: (data) => set({ placePosition: data }),
  phase: "home",
  threePhase: "home",
  setPhase: (data) => set({ phase: data }),
  setThreePhase: (data) => set({ threePhase: data }),
  setTriggerDialog: (data) => set({ triggerDialog: data }),
  triggerDialog: false,
  dialogPhase: false,
  allowedDialog: true,
  setAllowedDialog: (data) => set({ allowedDialog: data }),
  allowedBottles: true,
  setAllowedBottles: (data) => set({ allowedBottles: data }),
  setDialogPhase: (data) => set({ dialogPhase: data }),
}));
